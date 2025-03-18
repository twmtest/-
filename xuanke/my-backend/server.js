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
    res.json({ token, name: user.name, studentId: user[idField] });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 