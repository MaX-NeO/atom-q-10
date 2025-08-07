import { UserRole } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { quizId } = req.query;

  if (typeof quizId !== "string") {
    return res.status(400).json({ message: "Invalid quiz ID" });
  }

  try {
    // Get users who are NOT enrolled in this quiz
    const enrolledUserIds = await prisma.quizUser.findMany({
      where: { quizId },
      select: { userId: true },
    });

    const enrolledIds = enrolledUserIds.map((enrollment) => enrollment.userId);

    // Build the where clause dynamically
    const whereClause: any = {
      role: UserRole.USER,
      isActive: true,
    };

    // Exclude already enrolled users
    if (enrolledIds.length > 0) {
      whereClause.id = {
        notIn: enrolledIds,
      };
    }

    const availableUsers = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(availableUsers);
  } catch (error) {
    console.error("Error fetching available users:", error);
    res.status(500).json({ message: "Error fetching available users" });
  }
}