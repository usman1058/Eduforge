import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@eduforge.com" },
    update: {},
    create: {
      email: "admin@eduforge.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("Admin user created:", admin.email)

  // Create initial services
  const services = [
    {
      name: "Essay Writing",
      slug: "essay-writing",
      description: "Professional essay writing assistance for all academic levels",
      longDescription: "Our expert writers provide comprehensive essay writing services, including research papers, argumentative essays, descriptive essays, and more. We ensure originality, proper formatting, and adherence to academic standards.",
      idealUseCase: "Research papers, argumentative essays, academic papers",
      estimatedTurnaround: "3-7 days",
      pricingNote: "Price depends on word count and complexity",
    },
    {
      name: "Research Paper Assistance",
      slug: "research-paper-assistance",
      description: "Complete research paper support from topic selection to final draft",
      longDescription: "We offer end-to-end research paper assistance including topic development, literature review, methodology, data analysis, and final writing. Perfect for thesis, dissertations, and academic publications.",
      idealUseCase: "Thesis, dissertations, academic publications",
      estimatedTurnaround: "1-4 weeks",
      pricingNote: "Custom pricing based on complexity",
    },
    {
      name: "Assignment Help",
      slug: "assignment-help",
      description: "Assistance with various types of academic assignments",
      longDescription: "Get expert help with homework assignments, case studies, lab reports, book reviews, and other academic tasks. We provide detailed solutions with explanations to help you learn.",
      idealUseCase: "Homework, case studies, lab reports",
      estimatedTurnaround: "1-3 days",
      pricingNote: "Fixed pricing based on assignment type",
    },
    {
      name: "Dissertation Writing",
      slug: "dissertation-writing",
      description: "Comprehensive dissertation and thesis writing services",
      longDescription: "Our dissertation services cover proposal development, literature review, research methodology, data collection and analysis, and complete dissertation writing. We work with you through every chapter.",
      idealUseCase: "PhD and Master's dissertations",
      estimatedTurnaround: "2-6 months",
      pricingNote: "Custom pricing for long-term projects",
    },
    {
      name: "Editing & Proofreading",
      slug: "editing-proofreading",
      description: "Professional editing and proofreading for academic papers",
      longDescription: "Our expert editors review your work for grammar, spelling, punctuation, clarity, and academic tone. We also check for consistency, flow, and adherence to formatting guidelines.",
      idealUseCase: "Improving existing papers, final review",
      estimatedTurnaround: "1-3 days",
      pricingNote: "Price based on word count",
    },
    {
      name: "Presentation Creation",
      slug: "presentation-creation",
      description: "Professional presentation slides and speaker notes",
      longDescription: "We create engaging, professional presentation slides with clear visuals, proper formatting, and comprehensive speaker notes. Perfect for class presentations, conferences, and thesis defenses.",
      idealUseCase: "Class presentations, conference slides",
      estimatedTurnaround: "1-2 days",
      pricingNote: "Fixed pricing based on slide count",
    },
    {
      name: "Data Analysis",
      slug: "data-analysis",
      description: "Statistical analysis and data interpretation services",
      longDescription: "Our statisticians help with quantitative and qualitative data analysis using various statistical tools and software. We provide comprehensive reports with visualizations and interpretations.",
      idealUseCase: "Research projects, thesis analysis",
      estimatedTurnaround: "3-7 days",
      pricingNote: "Custom pricing based on analysis complexity",
    },
    {
      name: "Case Study Writing",
      slug: "case-study-writing",
      description: "Professional case study writing and analysis",
      longDescription: "We write detailed case studies following proper academic structure including introduction, problem statement, analysis, solutions, and conclusions. Perfect for business, medical, and academic case studies.",
      idealUseCase: "Business, medical, and academic case studies",
      estimatedTurnaround: "2-5 days",
      pricingNote: "Price depends on case complexity",
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }

  console.log("Services created successfully")

  // Create system settings
  const settings = [
    {
      key: "platform_name",
      value: "Eduforge",
      category: "general",
    },
    {
      key: "payment_instructions",
      value: "Please transfer payment to the following bank account:\n\nBank Name: ABC Bank\nAccount Name: Eduforge Services\nAccount Number: 123456789\n\nAfter payment, upload your receipt and enter the reference number.",
      category: "payment",
    },
    {
      key: "max_file_size_mb",
      value: "10",
      category: "files",
    },
    {
      key: "allowed_file_types",
      value: "pdf,doc,docx,zip,mp3,wav",
      category: "files",
    },
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log("System settings created successfully")

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
