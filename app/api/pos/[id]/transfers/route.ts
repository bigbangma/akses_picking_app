export async function GET(request: Request,{params}: {params: {id: string}}) {
  const { id } = params;

  try {

    // Second fetch with the session ID included in the headers as a cookie
    const dataResponse = await fetch(`http://192.168.212.11:8018/api/pos/${id}/transfers`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer fb0cf024173367785ed952665d8bd790efaee0f1",
      },
    });


    const data = await dataResponse.json();

    return Response.json(data);
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}