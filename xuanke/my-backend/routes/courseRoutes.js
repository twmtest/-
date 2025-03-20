const express = require('express');
const pool = require('../db');

const router = express.Router();

// 获取所有课程信息的接口，支持筛选
router.get('/courses', async (req, res) => {
  const { name, teacher, schedule } = req.query;
  let query = `
    SELECT c.course_id, c.name AS courseName, c.credit, c.schedule, c.location, c.description, t.teacher_id AS teacherId, t.name AS teacherName
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

// 添加新课程
router.post('/courses', async (req, res) => {
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

// 更新课程信息
router.put('/courses/:courseId', async (req, res) => {
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

// 删除课程
router.delete('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    await pool.query(`DELETE FROM courses WHERE course_id = ?`, [courseId]);
    res.status(200).json({ message: '课程删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 