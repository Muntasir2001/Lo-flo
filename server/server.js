import cors from "@fastify/cors";
import dotenv from "dotenv";
import fastify from "fastify";
// import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = fastify();
app.register(sensible);
// app.register(cookie, { secret: process.env.COOKIE_SECRET });
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});

const prisma = new PrismaClient();

app.get("/flashcards", async (req, res) => {
  return await commitToDb(
    prisma.flashCards.findMany({
      select: {
        id: true,
        question: true,
        solution: true,
      },
    })
  );
});

app.get("/all", async (req, res) => {
  return await commitToDb(
    prisma.cards.findMany({
      // select will only get the specified columns
      select: {
        id: true,
        title: true,
        subjects: {
          select: {
            title: true,
            flashCards: {
              select: {
                id: true,
                question: true,
                solution: true,
              },
            },
          },
        },
      },
    })
  );
});

app.get("/cards", async (req, res) => {
  return await commitToDb(
    prisma.cards.findMany({
      // select will only get the specified columns
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.post("/cards", async (req, res) => {
  if (req.body.title === "" || req.body.title == null) {
    return res.send(app.httpErrors.badRequest("Title is required"));
  }

  if (req.body.title.length > 13) {
    return res.send(app.httpErrors.badRequest("Title it too long. Max Characters: 13"))
  }

  return await commitToDb(
    prisma.cards.create({
      data: {
        title: req.body.title,
      },
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.put("/cards/:cardId", async (req, res) => {
  if (req.body.title === "" || req.body.title == null) {
    return res.send(app.httpErrors.badRequest("Title is required"));
  }

  return await commitToDb(
    prisma.cards.update({
      where: { id: req.params.cardId },
      data: {
        title: req.body.title,
      },
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.delete("/cards/:cardId", async (req, res) => {
  return await commitToDb(
    prisma.cards.delete({
      where: { id: req.params.cardId },
      select: { id: true },
    })
  );
});

app.get("/cards/:cardId/subjects", async (req, res) => {
  return await commitToDb(
    prisma.cards.findUnique({
      where: {
        id: req.params.cardId,
      },
      select: {
        id: true,
        title: true,
        subjects: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })
  );
});

app.post("/cards/:cardId/subjects", async (req, res) => {
  if (req.body.title === "" || req.body.title == null) {
    return res.send(app.httpErrors.badRequest("Title is required"));
  }

  return await commitToDb(
    prisma.subjects.create({
      data: {
        title: req.body.title,
        cardId: req.params.cardId,
      },
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.put("/cards/:cardId/subjects/:subjectId", async (req, res) => {
  if (req.body.title === "" || req.body.title == null) {
    return res.send(app.httpErrors.badRequest("Title is required"));
  }

  return await commitToDb(
    prisma.subjects.update({
      where: { id: req.params.subjectId },
      data: {
        title: req.body.title,
      },
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.delete("/cards/:cardId/subjects/:subjectId", async (req, res) => {
  return await commitToDb(
    prisma.subjects.delete({
      where: { id: req.params.subjectId },
      select: { id: true },
    })
  );
});

app.get("/cards/:id/subjects/:subjectId/flashcards", async (req, res) => {
  return await commitToDb(
    prisma.subjects.findUnique({
      where: {
        id: req.params.subjectId,
      },
      select: {
        id: true,
        title: true,
        flashCards: {
          select: {
            id: true,
            question: true,
            solution: true,
          },
        },
      },
    })
  );
});

app.post("/cards/:cardId/subjects/:subjectId/flashcards", async (req, res) => {
  if (
    req.body.question === "" ||
    req.body.question == null ||
    req.body.solution === "" ||
    req.body.solution == null
  ) {
    return res.send(app.httpErrors.badRequest("Both Question and Solution are required"));
  }

  return await commitToDb(
    prisma.flashCards.create({
      data: {
        question: req.body.question,
        solution: req.body.solution,
        subjectId: req.params.subjectId,
      },
      select: {
        id: true,
        question: true,
        solution: true,
      },
    })
  );
});

app.put("/cards/:cardId/subjects/:subjectId/flashcards/:flashcardId", async (req, res) => {
  if (
    req.body.question === "" ||
    req.body.question == null ||
    req.body.solution === "" ||
    req.body.solution == null
  ) {
    return res.send(app.httpErrors.badRequest("Both Question and Solution are required"));
  }

  return await commitToDb(
    prisma.flashCards.update({
      where: { id: req.params.flashcardId },
      data: {
        question: req.body.question,
        solution: req.body.solution,
        subjectId: req.params.subjectId,
      },
      select: {
        id: true,
        question: true,
        solution: true,
      },
    })
  );
});

app.delete("/cards/:cardId/subjects/:subjectId/flashcards/:flashcardId", async (req, res) => {
  return await commitToDb(
    prisma.flashCards.delete({
      where: { id: req.params.flashcardId },
      select: { id: true },
    })
  );
});

async function commitToDb(promise) {
  const [error, data] = await app.to(promise);
  // ? send a 500 error for our user
  // ? to see the error message, change inside select, id: true to id:ajsdfkljas and check browser
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}

app.listen({ port: process.env.PORT }).then(() => console.log("started on port", process.env.PORT));
