const express = require('express');
const pool = require('../db');

let multer, upload, fs, csv;
try {
  multer = require('multer');
  upload = multer({ dest: 'uploads/' });
  fs = require('fs');
  try {
    csv = require('csv-parser');
  } catch (e) {
    console.warn('警告: csv-parser 未安装，文件上传功能将受限');
  }
} catch (e) {
  console.warn('警告: multer 未安装，文件上传功能将受限');
  // 提供一个假的 upload.single 方法，防止服务器崩溃
  upload = { single: () => (req, res, next) => next() };
}

const router = express.Router();

// 获取教师教授的课程信息
router.get('/teacher/:teacherId/courses', async (req, res) => {
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

// 获取教师教授课程的学生选课信息
router.get('/teacher/:teacherId/course-selections', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [selections] = await pool.query(`
      SELECT cs.selection_id, cs.student_id, s.name AS studentName, c.course_id, c.name AS courseName, cs.status
      FROM course_selections cs
      JOIN courses c ON cs.course_id = c.course_id
      JOIN students s ON cs.student_id = s.student_id
      WHERE c.teacher_id = ?
    `, [teacherId]);
    res.json(selections);
  } catch (error) {
    console.error('获取课程选课信息失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取教师教授课程的学生成绩
router.get('/teacher/:teacherId/student-grades', async (req, res) => {
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
router.put('/grades/:gradeId', async (req, res) => {
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

// 教师审核选课申请
router.post('/teacher/approve-application', async (req, res) => {
  const { applicationId } = req.body;
  try {
    const [application] = await pool.query(`SELECT student_id, course_id FROM course_applications WHERE application_id = ?`, [applicationId]);
    if (application.length > 0) {
      const { student_id, course_id } = application[0];
      await pool.query(`INSERT INTO course_selections (student_id, course_id, status) VALUES (?, ?, '已选课')`, [student_id, course_id]);
      await pool.query(`UPDATE course_applications SET status = '已确认' WHERE application_id = ?`, [applicationId]);
      res.status(200).json({ message: '选课申请已同意' });
    } else {
      res.status(404).json({ message: '申请记录未找到' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 教师驳回选课申请
router.post('/teacher/reject-application', async (req, res) => {
  const { applicationId } = req.body;
  try {
    await pool.query(`UPDATE course_applications SET status = '已驳回' WHERE application_id = ?`, [applicationId]);
    res.status(200).json({ message: '选课申请已驳回' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取教师的选课申请
router.get('/teacher/:teacherId/course-applications', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取退课申请
router.get('/teacher/:teacherId/drop-requests', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [requests] = await pool.query(`
      SELECT cs.student_id, cs.course_id, s.name AS studentName, c.name AS courseName
      FROM course_selections cs
      JOIN students s ON cs.student_id = s.student_id
      JOIN courses c ON cs.course_id = c.course_id
      WHERE cs.status = '申请退课' AND c.teacher_id = ?
    `, [teacherId]);
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 教师处理退课请求
router.post('/teacher/drop-course', async (req, res) => {
  const { studentId, courseId } = req.body;
  const connection = await pool.getConnection();
  try {
    console.log(`退课操作 - 学生ID: ${studentId}, 课程ID: ${courseId}, 类型: ${typeof courseId}`);
    await connection.beginTransaction();
    
    // 从 course_selections 表中删除记录
    // 确保 course_id 的类型匹配（转换为字符串）
    const [deleteResult] = await connection.query(
      `DELETE FROM course_selections WHERE student_id = ? AND course_id = ?`, 
      [studentId, courseId.toString()]
    );
    console.log(`删除course_selections表记录: 影响行数=${deleteResult.affectedRows}`);

    // 更新 course_applications 表中的状态为 '已驳回'
    // 确保 course_id 的类型匹配（转换为数字）
    const courseIdNum = parseInt(courseId, 10);
    const [updateResult] = await connection.query(
      `UPDATE course_applications SET status = '已驳回' WHERE student_id = ? AND course_id = ?`, 
      [studentId, courseIdNum]
    );
    console.log(`更新course_applications表状态: 影响行数=${updateResult.affectedRows}`);
    
    await connection.commit();
    res.status(200).json({ message: '退课成功' });
  } catch (error) {
    await connection.rollback();
    console.error('退课失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
});

// 获取教师的课程统计信息
router.get('/teacher/:teacherId/course-statistics', async (req, res) => {
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
    console.error('获取课程统计失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 教师审核选课申请
router.put('/teacher/:teacherId/approve-application/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  try {
    // 更新申请状态
    await pool.query(`UPDATE course_applications SET status = ? WHERE application_id = ?`, [status, applicationId]);

    if (status === '已确认') {
      // 获取申请的学生ID和课程ID
      const [application] = await pool.query(`SELECT student_id, course_id FROM course_applications WHERE application_id = ?`, [applicationId]);
      const { student_id, course_id } = application[0];

      // 插入到 course_selections 表中
      await pool.query(`INSERT INTO course_selections (student_id, course_id, status) VALUES (?, ?, '已选课')`, [student_id, course_id]);
    }

    res.status(200).json({ message: '选课申请状态已更新' });
  } catch (error) {
    console.error('更新选课申请状态失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量上传学生成绩
router.post('/teacher/:teacherId/upload-grades', upload.single('file'), async (req, res) => {
  const { teacherId } = req.params;
  const { courseId } = req.body;
  
  if (!multer || !csv) {
    return res.status(500).json({ 
      message: '服务器未安装文件处理模块，请联系管理员安装 multer 和 csv-parser' 
    });
  }
  
  try {
    // 处理文件上传
    if (req.file) {
      const results = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          // 处理CSV数据
          try {
            for (const row of results) {
              const studentId = row['学号'];
              const regularScore = parseFloat(row['平时成绩']) || null;
              const midtermScore = parseFloat(row['期中成绩']) || null;
              const finalScore = parseFloat(row['期末成绩']) || null;
              
              // 计算总成绩 (可根据实际需求调整计算方式)
              const totalScore = regularScore && midtermScore && finalScore ? 
                (regularScore * 0.3 + midtermScore * 0.3 + finalScore * 0.4).toFixed(2) : null;
              
              // 检查成绩是否已存在
              const [existingGrade] = await pool.query(
                `SELECT * FROM grades WHERE student_id = ? AND course_id = ?`,
                [studentId, courseId]
              );
              
              if (existingGrade.length > 0) {
                // 更新已有成绩
                await pool.query(
                  `UPDATE grades SET regular_score = ?, midterm_score = ?, final_score = ?, total_score = ? 
                   WHERE student_id = ? AND course_id = ?`,
                  [regularScore, midtermScore, finalScore, totalScore, studentId, courseId]
                );
              } else {
                // 插入新成绩
                await pool.query(
                  `INSERT INTO grades (student_id, course_id, regular_score, midterm_score, final_score, total_score)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [studentId, courseId, regularScore, midtermScore, finalScore, totalScore]
                );
              }
            }
            
            // 删除临时文件
            fs.unlinkSync(req.file.path);
            
            res.status(200).json({ message: '成绩导入成功' });
          } catch (error) {
            console.error('处理成绩数据失败:', error.message);
            res.status(500).json({ message: '处理成绩数据失败' });
          }
        });
    } else if (req.body.grades) {
      // 处理手动输入的数据
      const grades = JSON.parse(req.body.grades);
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        for (const grade of grades) {
          const { studentId, courseId, regularScore, midtermScore, finalScore } = grade;
          
          // 计算总成绩
          const totalScore = regularScore && midtermScore && finalScore ? 
            (regularScore * 0.3 + midtermScore * 0.3 + finalScore * 0.4).toFixed(2) : null;
          
          // 检查成绩是否已存在
          const [existingGrade] = await connection.query(
            `SELECT * FROM grades WHERE student_id = ? AND course_id = ?`,
            [studentId, courseId]
          );
          
          if (existingGrade.length > 0) {
            // 更新已有成绩
            await connection.query(
              `UPDATE grades SET regular_score = ?, midterm_score = ?, final_score = ?, total_score = ? 
               WHERE student_id = ? AND course_id = ?`,
              [regularScore, midtermScore, finalScore, totalScore, studentId, courseId]
            );
          } else {
            // 插入新成绩
            await connection.query(
              `INSERT INTO grades (student_id, course_id, regular_score, midterm_score, final_score, total_score)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [studentId, courseId, regularScore, midtermScore, finalScore, totalScore]
            );
          }
        }
        
        await connection.commit();
        res.status(200).json({ message: '成绩导入成功' });
      } catch (error) {
        await connection.rollback();
        console.error('处理成绩数据失败:', error.message);
        res.status(500).json({ message: '处理成绩数据失败' });
      } finally {
        connection.release();
      }
    } else {
      res.status(400).json({ message: '未提供成绩数据' });
    }
  } catch (error) {
    console.error('上传成绩失败:', error.message);
    res.status(500).json({ message: '服务器错误: ' + error.message });
  }
});

module.exports = router; 