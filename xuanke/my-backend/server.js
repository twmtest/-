const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key';

// 登录接口
app.post('/api/login', async (req, res) => {
  const { identity, username, password } = req.body; // username 现在是 student_id

  let table;
  let idField;
  switch (identity) {
    case 'student':
      table = 'students';
      idField = 'student_id';
      break;
    case 'teacher':
      table = 'teachers';
      idField = 'teacher_id';
      break;
    case 'admin':
      table = 'admins';
      idField = 'admin_id';
      break;
    default:
      return res.status(400).json({ message: '无效的身份' });
  }

  try {
    console.log(`查询表: ${table}, ID字段: ${idField}, 用户名: ${username}`);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [username]);
    console.log(`查询结果: ${JSON.stringify(rows)}`);

    if (rows.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = rows[0];
    // 使用 bcrypt.compare 比较密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '密码错误' });
    }

    const token = jwt.sign({ id: user[idField], identity }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, name: user.name, [`${identity}Id`]: user[idField] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户注册接口
app.post('/api/register', async (req, res) => {
  const { identity, username, name, gender, birthdate, password, title } = req.body; // 添加 title 字段

  let table;
  let idField;
  switch (identity) {
    case 'student':
      table = 'students';
      idField = 'student_id';
      break;
    case 'teacher':
      table = 'teachers';
      idField = 'teacher_id';
      break;
    case 'admin':
      table = 'admins';
      idField = 'admin_id';
      break;
    default:
      return res.status(400).json({ message: '无效的身份' });
  }

  try {
    // 检查是否已存在相同的 ID
    const [existingUser] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: `${identity === 'teacher' ? '教师工号' : identity === 'student' ? '学号' : '管理员ID'} 已存在` });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10是盐的轮数

    // 将用户信息存储到数据库
    if (identity === 'student') {
      await pool.query(`INSERT INTO ${table} (${idField}, name, gender, birthdate, password) VALUES (?, ?, ?, ?, ?)`, [username, name, gender, birthdate, hashedPassword]);
    } else if (identity === 'teacher') {
      await pool.query(`INSERT INTO ${table} (${idField}, name, gender, birthdate, title, password) VALUES (?, ?, ?, ?, ?, ?)`, [username, name, gender, birthdate, title, hashedPassword]);
    } else if (identity === 'admin') {
      await pool.query(`INSERT INTO ${table} (${idField}, name, password) VALUES (?, ?, ?)`, [username, name, hashedPassword]);
    }

    res.status(201).json({ message: '用户注册成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有课程信息的接口，支持筛选
app.get('/api/courses', async (req, res) => {
  const { name, teacher, schedule } = req.query;
  let query = `
    SELECT c.course_id, c.name AS courseName, c.credit, c.schedule, c.location, c.description, t.name AS teacherName
    FROM courses c
    JOIN teachers t ON c.teacher_id = t.teacher_id
    WHERE 1=1
  `;
  const params = [];
  if (name) {
    query += ' AND c.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (teacher) {
    query += ' AND t.name LIKE ?';
    params.push(`%${teacher}%`);
  }
  if (schedule) {
    query += ' AND c.schedule LIKE ?';
    params.push(`%${schedule}%`);
  }
  try {
    const [courses] = await pool.query(query, params);
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生选课信息的接口
app.get('/api/student/:studentId/courses', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [selections] = await pool.query(`
      SELECT cs.selection_id, c.course_id, c.name AS courseName, c.credit, c.schedule, c.location, t.name AS teacherName
      FROM course_selections cs
      JOIN courses c ON cs.course_id = c.course_id
      JOIN teachers t ON c.teacher_id = t.teacher_id
      WHERE cs.student_id = ?
    `, [studentId]);
    res.json(selections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生成绩信息的接口
app.get('/api/student/:studentId/grades', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [grades] = await pool.query(`
      SELECT g.course_id, c.name AS courseName, g.regular_score, g.midterm_score, g.final_score, g.total_score
      FROM grades g
      JOIN courses c ON g.course_id = c.course_id
      WHERE g.student_id = ?
    `, [studentId]);
    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 学生选课接口
app.post('/api/student/:studentId/select-course', async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;
  try {
    const [existingSelection] = await pool.query(`
      SELECT * FROM course_selections WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    if (existingSelection.length > 0) {
      return res.status(400).json({ message: '已选过该课程' });
    }

    await pool.query(`
      INSERT INTO course_selections (student_id, course_id, status) VALUES (?, ?, '已选')
    `, [studentId, courseId]);

    res.status(201).json({ message: '选课成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 学生退课接口
app.delete('/api/student/:studentId/drop-course/:courseId', async (req, res) => {
  const { studentId, courseId } = req.params;
  try {
    // 检查是否存在成绩
    const [grades] = await pool.query(`
      SELECT * FROM grades WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    if (grades.length > 0) {
      return res.status(400).json({ message: '该课程已有成绩，无法退课' });
    }

    // 删除选课记录
    await pool.query(`
      DELETE FROM course_selections WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    res.status(200).json({ message: '退课成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取教师教授的课程信息
app.get('/api/teacher/:teacherId/courses', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [courses] = await pool.query(`
      SELECT c.course_id, c.name AS courseName, c.credit, c.schedule, c.location, c.description
      FROM courses c
      WHERE c.teacher_id = ?
    `, [teacherId]);
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新课程信息
app.put('/api/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const { courseName, schedule, location, credit, description } = req.body;
  try {
    await pool.query(`
      UPDATE courses SET name = ?, schedule = ?, location = ?, credit = ?, description = ?
      WHERE course_id = ?
    `, [courseName, schedule, location, credit, description, courseId]);
    res.status(200).json({ message: '课程更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加新课程
app.post('/api/courses', async (req, res) => {
  const { courseName, schedule, location, credit, description, teacherId } = req.body;
  try {
    await pool.query(`
      INSERT INTO courses (name, schedule, location, credit, description, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [courseName, schedule, location, credit, description, teacherId]);
    res.status(201).json({ message: '课程添加成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除课程
app.delete('/api/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    await pool.query(`DELETE FROM courses WHERE course_id = ?`, [courseId]);
    res.status(200).json({ message: '课程删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取教师教授课程的选课记录
app.get('/api/teacher/:teacherId/course-selections', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [selections] = await pool.query(`
      SELECT cs.selection_id AS selectionId, c.name AS courseName, s.name AS studentName, s.student_id AS studentId, cs.status
      FROM course_selections cs
      JOIN courses c ON cs.course_id = c.course_id
      JOIN students s ON cs.student_id = s.student_id
      WHERE c.teacher_id = ?
    `, [teacherId]);
    res.json(selections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新选课状态
app.put('/api/course-selections/:selectionId', async (req, res) => {
  const { selectionId } = req.params;
  const { status } = req.body;
  try {
    await pool.query(`
      UPDATE course_selections SET status = ? WHERE selection_id = ?
    `, [status, selectionId]);
    res.status(200).json({ message: '选课状态更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取课程选课统计
app.get('/api/teacher/:teacherId/course-statistics', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [statistics] = await pool.query(`
      SELECT c.name AS courseName, COUNT(cs.student_id) AS studentCount
      FROM courses c
      LEFT JOIN course_selections cs ON c.course_id = cs.course_id
      WHERE c.teacher_id = ?
      GROUP BY c.course_id
    `, [teacherId]);
    res.json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取教师教授课程的学生成绩
app.get('/api/teacher/:teacherId/student-grades', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [grades] = await pool.query(`
      SELECT g.grade_id AS gradeId, c.name AS courseName, s.name AS studentName, g.regular_score AS regularScore, g.midterm_score AS midtermScore, g.final_score AS finalScore, g.total_score AS totalScore
      FROM grades g
      JOIN courses c ON g.course_id = c.course_id
      JOIN students s ON g.student_id = s.student_id
      WHERE c.teacher_id = ?
    `, [teacherId]);
    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新学生成绩
app.put('/api/grades/:gradeId', async (req, res) => {
  const { gradeId } = req.params;
  const { regularScore, midtermScore, finalScore, totalScore } = req.body;
  try {
    await pool.query(`
      UPDATE grades SET regular_score = ?, midterm_score = ?, final_score = ?, total_score = ?
      WHERE grade_id = ?
    `, [regularScore, midtermScore, finalScore, totalScore, gradeId]);
    res.status(200).json({ message: '成绩更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 学生申请选课
app.post('/api/student/:studentId/apply-course', async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;

  console.log('收到选课申请:', studentId, courseId);

  try {
    // 检查学生和课程是否存在
    const [student] = await pool.query(`SELECT * FROM students WHERE student_id = ?`, [studentId]);
    const [course] = await pool.query(`SELECT * FROM courses WHERE course_id = ?`, [courseId]);

    if (student.length === 0 || course.length === 0) {
      console.log('学生或课程不存在');
      return res.status(400).json({ message: '学生或课程不存在' });
    }

    // 检查是否已经申请过
    const [existingApplication] = await pool.query(`
      SELECT * FROM course_applications WHERE student_id = ? AND course_id = ? AND status = '待审核'
    `, [studentId, courseId]);

    if (existingApplication.length > 0) {
      console.log('已申请该课程，等待审核');
      return res.status(400).json({ message: '已申请该课程，等待审核' });
    }

    // 插入申请记录
    await pool.query(`
      INSERT INTO course_applications (student_id, course_id) VALUES (?, ?)
    `, [studentId, courseId]);

    res.status(201).json({ message: '选课申请已提交，等待教师审核' });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 教师审核选课申请
app.put('/api/teacher/:teacherId/approve-application/:applicationId', async (req, res) => {
  const { teacherId, applicationId } = req.params;
  const { status } = req.body; // '已确认' 或 '已驳回'

  try {
    // 更新申请状态
    await pool.query(`
      UPDATE course_applications SET status = ? WHERE application_id = ?
    `, [status, applicationId]);

    if (status === '已确认') {
      // 获取申请信息
      const [application] = await pool.query(`
        SELECT student_id, course_id FROM course_applications WHERE application_id = ?
      `, [applicationId]);

      if (application.length > 0) {
        const { student_id, course_id } = application[0];

        // 将申请记录插入到选课表
        await pool.query(`
          INSERT INTO course_selections (student_id, course_id) VALUES (?, ?)
        `, [student_id, course_id]);
      }
    }

    res.status(200).json({ message: '申请处理成功' });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取教师的选课申请
app.get('/api/teacher/:teacherId/course-applications', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [applications] = await pool.query(`
      SELECT ca.application_id AS applicationId, c.name AS courseName, s.name AS studentName, s.student_id AS studentId, ca.status
      FROM course_applications ca
      JOIN courses c ON ca.course_id = c.course_id
      JOIN students s ON ca.student_id = s.student_id
      WHERE c.teacher_id = ? AND ca.status = '待审核'
    `, [teacherId]);
    res.json(applications);
  } catch (error) {
    console.error('获取选课申请失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生已申请的课程
app.get('/api/student/:studentId/applications', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [applications] = await pool.query(`
      SELECT course_id FROM course_applications WHERE student_id = ? AND status = '待审核'
    `, [studentId]);
    res.json(applications);
  } catch (error) {
    console.error('获取已申请课程失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生已选的课程
app.get('/api/student/:studentId/selections', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [selections] = await pool.query(`
      SELECT course_id FROM course_selections WHERE student_id = ?
    `, [studentId]);
    res.json(selections);
  } catch (error) {
    console.error('获取已选课程失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 