export async function POST(req: Request) {
  try {
    const body = await req.json();
  
    const { name, email, password, role, studentId, studentClass } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        studentId: role === "STUDENT" ? studentId : null,
        studentClass: role === "STUDENT" ? studentClass : null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}