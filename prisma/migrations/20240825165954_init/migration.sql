-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('EXERCISE', 'QUIZ', 'EXAM');

-- CreateTable
CREATE TABLE "School" (
    "schoolId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("schoolId")
);

-- CreateTable
CREATE TABLE "Permission" (
    "permissionId" TEXT NOT NULL,
    "maxCreateUser" INTEGER NOT NULL,
    "maxCreateCourse" INTEGER NOT NULL,
    "canCreateUser" BOOLEAN NOT NULL,
    "canUpdateUser" BOOLEAN NOT NULL,
    "canDeleteUser" BOOLEAN NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permissionId")
);

-- CreateTable
CREATE TABLE "Users" (
    "username" TEXT NOT NULL,
    "email" TEXT,
    "hashedPassword" TEXT NOT NULL,
    "studentNo" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "picture" TEXT,
    "containerID" TEXT,
    "IpAddress" TEXT,
    "isActived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "WorkSpace" (
    "codeSpaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "hashFilename" TEXT NOT NULL,

    CONSTRAINT "WorkSpace_pkey" PRIMARY KEY ("codeSpaceId")
);

-- CreateTable
CREATE TABLE "Course" (
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "CourseAnnounce" (
    "courseAnnounceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseAnnounce_pkey" PRIMARY KEY ("courseAnnounceId")
);

-- CreateTable
CREATE TABLE "CourseStudent" (
    "courseStudentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseStudent_pkey" PRIMARY KEY ("courseStudentId")
);

-- CreateTable
CREATE TABLE "CourseTeacher" (
    "courseStudentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseTeacher_pkey" PRIMARY KEY ("courseStudentId")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "assignmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isLock" BOOLEAN NOT NULL,
    "type" "AssignmentType" NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignmentId")
);

-- CreateTable
CREATE TABLE "Problem" (
    "problemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hint" TEXT,
    "revaleCode" TEXT,
    "constraints" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignmentId" TEXT NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("problemId")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "testCaseId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("testCaseId")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submissionId" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CourseAnnounce_userId_key" ON "CourseAnnounce"("userId");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSpace" ADD CONSTRAINT "WorkSpace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAnnounce" ADD CONSTRAINT "CourseAnnounce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAnnounce" ADD CONSTRAINT "CourseAnnounce_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseStudent" ADD CONSTRAINT "CourseStudent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseStudent" ADD CONSTRAINT "CourseStudent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTeacher" ADD CONSTRAINT "CourseTeacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTeacher" ADD CONSTRAINT "CourseTeacher_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("problemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("problemId") ON DELETE RESTRICT ON UPDATE CASCADE;
