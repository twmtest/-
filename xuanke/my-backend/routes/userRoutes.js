const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// 登录接口
router.post('/login', async (req, res) => {
  const { identity, username, password } = req.body;

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
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = rows[0];
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
router.post('/register', async (req, res) => {
  const { identity, username, name, gender, birthdate, password, title } = req.body;

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
    const [existingUser] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: `${identity === 'teacher' ? '教师工号' : identity === 'student' ? '学号' : '管理员ID'} 已存在` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

// 获取所有用户
router.get('/users', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT student_id AS username, name, gender, birthdate FROM students');
    const [teachers] = await pool.query('SELECT teacher_id AS username, name, title, gender, birthdate FROM teachers');
    const [admins] = await pool.query('SELECT admin_id AS username, name FROM admins');
    res.json({ students, teachers, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户
router.delete('/users/:type/:username', async (req, res) => {
  const { type, username } = req.params;
  let table;
  let idField;
  switch (type) {
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
      return res.status(400).json({ message: '无效的用户类型' });
  }

  try {
    await pool.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [username]);
    res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户
router.put('/users/:type/:username', async (req, res) => {
  const { type, username } = req.params;
  const { name, gender, birthdate, title } = req.body;
  let table;
  let idField;
  switch (type) {
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
      return res.status(400).json({ message: '无效的用户类型' });
  }

  try {
    if (type === 'student') {
      await pool.query(`UPDATE ${table} SET name = ?, gender = ?, birthdate = ? WHERE ${idField} = ?`, [name, gender, birthdate, username]);
    } else if (type === 'teacher') {
      await pool.query(`UPDATE ${table} SET name = ?, title = ?, gender = ?, birthdate = ? WHERE ${idField} = ?`, [name, title, gender, birthdate, username]);
    } else if (type === 'admin') {
      await pool.query(`UPDATE ${table} SET name = ? WHERE ${idField} = ?`, [name, username]);
    }
    res.status(200).json({ message: '用户更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取系统统计数据
router.get('/statistics', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT COUNT(*) AS count FROM courses');
    const [students] = await pool.query('SELECT COUNT(*) AS count FROM students');
    const [teachers] = await pool.query('SELECT COUNT(*) AS count FROM teachers');
    const [admins] = await pool.query('SELECT COUNT(*) AS count FROM admins');

    res.json({
      courses: courses[0].count,
      students: students[0].count,
      teachers: teachers[0].count,
      admins: admins[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;