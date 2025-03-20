const express = require('express');
const pool = require('../db');

const router = express.Router();

// 获取学生选课信息的接口
router.get('/student/:studentId/courses', async (req, res) => {
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

// 学生申请课程
router.post('/student/:studentId/apply-course', async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;
  try {
    await pool.query(`INSERT INTO course_applications (student_id, course_id, status) VALUES (?, ?, '待审核')`, [studentId, courseId]);
    res.status(200).json({ message: '选课申请已提交，等待教师审核' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 学生退课接口
router.delete('/student/:studentId/drop-course/:courseId', async (req, res) => {
  const { studentId, courseId } = req.params;
  try {
    const [grades] = await pool.query(`
      SELECT * FROM grades WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    if (grades.length > 0) {
      return res.status(400).json({ message: '该课程已有成绩，无法退课' });
    }

    await pool.query(`
      DELETE FROM course_selections WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    res.status(200).json({ message: '退课成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生成绩
router.get('/student/:studentId/grades', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [grades] = await pool.query(`
      SELECT g.grade_id, c.name AS courseName, g.regular_score, g.midterm_score, g.final_score, g.total_score
      FROM grades g
      JOIN courses c ON g.course_id = c.course_id
      WHERE g.student_id = ?
    `, [studentId]);
    res.json(grades);
  } catch (error) {
    console.error('获取成绩失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生已选的课程
router.get('/student/:studentId/selections', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [selections] = await pool.query(`
      SELECT cs.course_id, c.name AS courseName, c.credit, c.schedule, c.location, t.name AS teacherName, cs.status
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

// 学生申请退课
router.post('/student/:studentId/apply-drop-course', async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;
  
  console.log('收到退课申请:', { studentId, courseId, courseIdType: typeof courseId });
  
  try {
    // 先查询当前状态
    const [currentStatus] = await pool.query(
      `SELECT status FROM course_selections WHERE student_id = ? AND course_id = ?`, 
      [studentId, courseId]
    );
    console.log('当前选课状态:', currentStatus);

    // 更新选课状态为"申请退课"
    const [updateResult] = await pool.query(
      `UPDATE course_selections SET status = '申请退课' WHERE student_id = ? AND course_id = ?`, 
      [studentId, courseId]
    );
    console.log('更新结果:', updateResult);
    
    res.status(200).json({ message: '退课申请已提交' });
  } catch (error) {
    console.error('申请退课失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取学生的课程申请
router.get('/student/:studentId/applications', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [applications] = await pool.query(`
      SELECT ca.application_id, ca.course_id, ca.status, c.name AS courseName
      FROM course_applications ca
      JOIN courses c ON ca.course_id = c.course_id
      WHERE ca.student_id = ?
    `, [studentId]);
    res.json(applications);
  } catch (error) {
    console.error('获取课程申请失败:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 