
import { PrismaClient, UserRole, DifficultyLevel, QuizStatus, QuestionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data in proper order to avoid constraint issues
  await prisma.quizAnswer.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.quizUser.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.question.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleaned existing data...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  console.log('Created admin user:', admin.email)

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10)
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@demo.com',
        name: 'John Doe',
        password: userPassword,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@demo.com',
        name: 'Jane Smith',
        password: userPassword,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@demo.com',
        name: 'Bob Johnson',
        password: userPassword,
        role: UserRole.USER,
      },
    }),
  ])

  console.log('Created users:', users.map(u => u.email))

  // Create sample questions
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        title: 'JavaScript Basics',
        content: 'What is the correct way to create a function in JavaScript?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify([
          'function myFunction() {}',
          'def myFunction():',
          'func myFunction() {}',
          'create function myFunction()'
        ]),
        correctAnswer: '0',
        explanation: 'In JavaScript, functions are created using the function keyword followed by the function name and parentheses.',
        difficulty: DifficultyLevel.EASY,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Array Methods',
        content: 'Which method adds elements to the end of an array?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify([
          'push()',
          'pop()',
          'shift()',
          'unshift()'
        ]),
        correctAnswer: '0',
        explanation: 'The push() method adds one or more elements to the end of an array.',
        difficulty: DifficultyLevel.EASY,
      },
    }),
    prisma.question.create({
      data: {
        title: 'React Hooks',
        content: 'What does useState return?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify([
          'An array with state value and setter function',
          'Just the state value',
          'Just the setter function',
          'An object with state properties'
        ]),
        correctAnswer: '0',
        explanation: 'useState returns an array with two elements: the current state value and a function to update it.',
        difficulty: DifficultyLevel.MEDIUM,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Async/Await',
        content: 'Is async/await blocking or non-blocking?',
        type: QuestionType.TRUE_FALSE,
        options: JSON.stringify(['Non-blocking', 'Blocking']),
        correctAnswer: '0',
        explanation: 'Async/await is non-blocking. It allows other code to run while waiting for asynchronous operations.',
        difficulty: DifficultyLevel.MEDIUM,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Node.js',
        content: 'What is Node.js primarily used for?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify([
          'Server-side JavaScript development',
          'Client-side styling',
          'Database management',
          'Image processing'
        ]),
        correctAnswer: '0',
        explanation: 'Node.js is a runtime environment that allows JavaScript to be used for server-side development.',
        difficulty: DifficultyLevel.EASY,
      },
    }),
  ])

  console.log('Created questions:', questions.length)

  // Create sample quizzes with explicit maxAttempts values
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'JavaScript Fundamentals',
      description: 'Test your basic JavaScript knowledge',
      timeLimit: 30,
      difficulty: DifficultyLevel.EASY,
      status: QuizStatus.ACTIVE,
      negativeMarking: false,
      randomOrder: false,
      maxAttempts: 3, // Explicit value
      creatorId: admin.id,
    },
  })

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'React & Node.js Quiz',
      description: 'Advanced concepts in React and Node.js',
      timeLimit: 45,
      difficulty: DifficultyLevel.MEDIUM,
      status: QuizStatus.ACTIVE,
      negativeMarking: true,
      negativePoints: 0.5,
      randomOrder: true,
      maxAttempts: null, // Unlimited attempts
      creatorId: admin.id,
    },
  })

  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'Quick Assessment',
      description: 'A quick 15-minute assessment',
      timeLimit: 15,
      difficulty: DifficultyLevel.EASY,
      status: QuizStatus.ACTIVE,
      negativeMarking: false,
      randomOrder: false,
      maxAttempts: null, // Unlimited attempts
      creatorId: admin.id,
    },
  })

  console.log('Created quizzes:', [quiz1.title, quiz2.title, quiz3.title])

  // Add questions to quizzes
  await Promise.all([
    // Quiz 1 questions
    prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        questionId: questions[0].id,
        order: 1,
        points: 1.0,
      },
    }),
    prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        questionId: questions[1].id,
        order: 2,
        points: 1.0,
      },
    }),
    prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        questionId: questions[4].id,
        order: 3,
        points: 1.0,
      },
    }),
    // Quiz 2 questions
    prisma.quizQuestion.create({
      data: {
        quizId: quiz2.id,
        questionId: questions[2].id,
        order: 1,
        points: 2.0,
      },
    }),
    prisma.quizQuestion.create({
      data: {
        quizId: quiz2.id,
        questionId: questions[3].id,
        order: 2,
        points: 2.0,
      },
    }),
    // Quiz 3 questions
    prisma.quizQuestion.create({
      data: {
        quizId: quiz3.id,
        questionId: questions[0].id,
        order: 1,
        points: 1.0,
      },
    }),
    prisma.quizQuestion.create({
      data: {
        quizId: quiz3.id,
        questionId: questions[1].id,
        order: 2,
        points: 1.0,
      },
    }),
  ])

  console.log('Added questions to quizzes...')

  // Enroll users in quizzes
  await Promise.all([
    // Enroll all users in JavaScript Fundamentals
    ...users.map(user => 
      prisma.quizUser.create({
        data: {
          quizId: quiz1.id,
          userId: user.id,
        },
      })
    ),
    // Enroll first two users in React & Node.js Quiz
    prisma.quizUser.create({
      data: {
        quizId: quiz2.id,
        userId: users[0].id,
      },
    }),
    prisma.quizUser.create({
      data: {
        quizId: quiz2.id,
        userId: users[1].id,
      },
    }),
    // Enroll all users in Quick Assessment
    ...users.map(user => 
      prisma.quizUser.create({
        data: {
          quizId: quiz3.id,
          userId: user.id,
        },
      })
    ),
  ])

  console.log('Enrolled users in quizzes...')

  console.log('✅ Demo data seeded successfully!')
  console.log('🔑 Admin: admin@demo.com / admin123')
  console.log('👥 Users: john@demo.com, jane@demo.com, bob@demo.com / user123')
  console.log(`📊 Created ${questions.length} questions and 3 quizzes`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
