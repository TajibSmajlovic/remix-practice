import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import type { Post } from "~/models/post.server";

import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

type LoaderData = { post?: Post };

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);

  const { slug } = params;

  invariant(slug, "slug is required!");

  if (slug === "new") {
    return json<LoaderData>({});
  }

  const post = await getPost(slug);
  if (!post) {
    throw new Response("Not found!", { status: 404 });
  }

  return json<LoaderData>({ post });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(params.slug, "slug is required");

  if (intent === "delete") {
    await deletePost(params.slug);

    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  const errors: ActionData = {
    title: title ? null : "Title is required!",
    slug: slug ? null : "Slug is required!",
    markdown: markdown ? null : "Markdown is required!",
  };

  const hasErrors = Object.values(errors).some((error) => error);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "title must be string");
  invariant(typeof slug === "string", "slug must be string");
  invariant(typeof markdown === "string", "markdown must be string");

  const post = {
    title,
    slug,
    markdown,
  };

  invariant(params.slug);

  if (params.slug === "new") {
    await createPost(post);
  } else {
    await updatePost(params.slug, post);
  }

  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPostRoute() {
  const errors = useActionData<ActionData>();
  const data = useLoaderData<LoaderData>();
  const { submission } = useTransition();

  const isCreating = submission?.formData.get("intent") === "create";
  const isUpdating = submission?.formData.get("intent") === "update";
  const isDeleting = submission?.formData.get("intent") === "delete";
  const isNewPost = Boolean(!data?.post);

  return (
    <Form method="post" key={data?.post?.slug ?? "new"}>
      <p>
        <label>
          Post Title:
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            defaultValue={data?.post?.title}
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={data?.post?.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={data?.post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {isNewPost ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {!isDeleting ? (isDeleting ? "Deleting..." : "Delete post") : null}
          </button>
        )}

        <button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create new post") : null}
          {!isNewPost ? (isUpdating ? "Updating..." : "Update post") : null}
        </button>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Not found!</div>;
  }

  return <div>Error!</div>;
}

// export function ErrorBoundary({ error }: { error: Error }) {
//   return (
//     <div className="text-red-500">
//       Oh no! Something went wrong!
//       <pre>{error.message}</pre>
//     </div>
//   );
// }
