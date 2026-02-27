export default {
    providers: [
        {
            domain: process.env.CLERK_JWT_ISSUER ?? "https://clerk.jeffdash.com",
            applicationID: "convex",
        },
    ],
};
