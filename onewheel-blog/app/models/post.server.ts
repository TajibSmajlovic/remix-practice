import type { Post } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Post };

export async function getPostListings() {
  return await prisma.post.findMany({
    select: {
      slug: true,
      title: true,
    },
  });
}

export async function getPosts() {
  return await prisma.post.findMany();
}

export async function getPost(slug: string) {
  return await prisma.post.findUnique({
    where: {
      slug,
    },
  });
}

export async function createPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  await prisma.post.create({ data: post });
}

export async function updatePost(
  slug: string,
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  await prisma.post.update({ where: { slug }, data: post });
}

export async function deletePost(slug: string) {
  await prisma.post.delete({
    where: {
      slug,
    },
  });
}
