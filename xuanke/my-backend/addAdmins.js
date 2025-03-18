const bcrypt = require('bcryptjs');
const pool = require('./db'); // 假设你有一个数据库连接池

async function addAdminToDatabase(adminId, name, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO admins (admin_id, name, password) VALUES (?, ?, ?)';
    const values = [adminId, name, hashedPassword];
    await pool.query(query, values);
    console.log(`管理员 ${name} 添加成功`);
  } catch (error) {
    console.error('添加管理员时出错:', error);
  }
}

async function addStudentToDatabase(studentId, name, gender, birthdate, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO students (student_id, name, gender, birthdate, password) VALUES (?, ?, ?, ?, ?)';
    const values = [studentId, name, gender, birthdate, hashedPassword];
    await pool.query(query, values);
    console.log(`学生 ${name} 添加成功`);
  } catch (error) {
    console.error('添加学生时出错:', error);
  }
}

async function addTeacherToDatabase(teacherId, name, gender, birthdate, title, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO teachers (teacher_id, name, gender, birthdate, title, password) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [teacherId, name, gender, birthdate, title, hashedPassword];
    await pool.query(query, values);
    console.log(`教师 ${name} 添加成功`);
  } catch (error) {
    console.error('添加教师时出错:', error);
  }
}

async function addCourseToDatabase(courseId, name, credit, teacherId, schedule, location, description) {
  try {
    const query = 'INSERT INTO courses (course_id, name, credit, teacher_id, schedule, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [courseId, name, credit, teacherId, schedule, location, description];
    await pool.query(query, values);
    console.log(`课程 ${name} 添加成功`);
  } catch (error) {
    console.error('添加课程时出错:', error);
  }
}

async function addCourseSelectionToDatabase(selectionId, studentId, courseId, grade, status) {
  try {
    const query = 'INSERT INTO course_selections (selection_id, student_id, course_id, grade, status) VALUES (?, ?, ?, ?, ?)';
    const values = [selectionId, studentId, courseId, grade, status];
    await pool.query(query, values);
    console.log(`选课记录 ${selectionId} 添加成功`);
  } catch (error) {
    console.error('添加选课记录时出错:', error);
  }
}

async function addGradeToDatabase(gradeId, studentId, courseId, regularScore, midtermScore, finalScore, totalScore) {
  try {
    const query = 'INSERT INTO grades (grade_id, student_id, course_id, regular_score, midterm_score, final_score, total_score) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [gradeId, studentId, courseId, regularScore, midtermScore, finalScore, totalScore];
    await pool.query(query, values);
    console.log(`成绩记录 ${gradeId} 添加成功`);
  } catch (error) {
    console.error('添加成绩记录时出错:', error);
  }
}

// 批量添加数据
async function batchInsertData() {
  // 添加管理员
  await addAdminToDatabase('A1', 'Admin1', '123');
  await addAdminToDatabase('A2', 'Admin2', '123');

  // 添加学生
  await addStudentToDatabase('S1', 'Student1', 'M', '2000-01-01', '123');
  await addStudentToDatabase('S2', 'Student2', 'F', '2001-02-02', '123');

  // 添加教师
  await addTeacherToDatabase('T1', 'Teacher1', 'M', '1980-03-03', '教授', '123');
  await addTeacherToDatabase('T2', 'Teacher2', 'F', '1985-04-04', '副教授', '123');

  // 添加课程
  await addCourseToDatabase('C1', 'Course1', 3.0, 'T1', '周一 9:00-11:00', '教室101', '课程1简介');
  await addCourseToDatabase('C2', 'Course2', 2.0, 'T2', '周二 10:00-12:00', '教室102', '课程2简介');

  // 添加选课记录
  await addCourseSelectionToDatabase(1, 'S1', 'C1', null, '已选');
  await addCourseSelectionToDatabase(2, 'S2', 'C2', null, '已选');

  // 添加成绩记录
  await addGradeToDatabase(1, 'S1', 'C1', 85.0, 88.0, 90.0, 87.7);
  await addGradeToDatabase(2, 'S2', 'C2', 78.0, 82.0, 80.0, 80.0);
}

// 执行批量插入
batchInsertData().then(() => {
  console.log('所有数据添加完成');
  process.exit(0);
}).catch(error => {
  console.error('批量插入数据时出错:', error);
  process.exit(1);
});