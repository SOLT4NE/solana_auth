import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import ProtectedComponent from "../../../components/protected"; // Import your protected component here

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req, secret });

  if (!token || !token.sub)
    return res.send({
      error: "User wallet not authenticated",
    });

  if (token) {
    // Render the ProtectedComponent when the token exists
    return res.send({
      component: "ProtectedComponent", // Send a key that indicates which component to render on the client
    });
  }

  res.send({
    error: "You must be signed in with your Solana Wallet to view the protected content on this page.",
  });
}
