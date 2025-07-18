export async function validateMercadoPagoToken(
  token: string
): Promise<boolean> {
  try {
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (_error) {
    console.error("Error validating token:", _error);

    return false;
  }
}
