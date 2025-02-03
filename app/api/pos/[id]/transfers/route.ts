export async function GET(request: Request,{params}:{
  params: Promise<{ id : string }>
}) {
  
  const id = (await params).id

  try {

    const backend = process.env.NEXT_PUBLIC_BACKEND_API
    const auth = process.env.NEXT_PUBLIC_BACKEND_AUTH

    // Second fetch with the session ID included in the headers as a cookie
    const dataResponse = await fetch(backend + `/api/pos/${id}/transfers`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + auth,
      },
    });


    const data = await dataResponse.json()

    return Response.json(data);
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}