export default {
    providers: [
        {
            // Production Clerk instance (custom domain)
            domain: "https://clerk.jeffdash.com",
            applicationID: "convex",
        },
        {
            // Development Clerk instance (pk_test_* → clerk.accounts.dev)
            domain: "https://aware-pug-70.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
