export async function GET(request: Request) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete('sid');
    return Response.redirect(new URL('/login', request.url));
}
