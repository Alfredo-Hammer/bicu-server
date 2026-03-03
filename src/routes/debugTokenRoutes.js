const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * ENDPOINT TEMPORAL para verificar el contenido del token JWT
 * ELIMINAR DESPUÉS DE DEBUGGING
 */

router.get('/decode-token', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó token en el header Authorization'
      });
    }

    const token = authHeader.substring(7);

    // Decodificar sin verificar (solo para ver el contenido)
    const decodedWithoutVerify = jwt.decode(token);

    // Decodificar y verificar
    let decodedWithVerify = null;
    let verificationError = null;
    try {
      decodedWithVerify = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      verificationError = error.message;
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      token_info: {
        decoded_payload: decodedWithoutVerify,
        is_valid: !verificationError,
        verification_error: verificationError,
        verified_payload: decodedWithVerify,
        has_organizationId: !!decodedWithoutVerify?.organizationId,
        organizationId_value: decodedWithoutVerify?.organizationId || null,
        has_organization_id: !!decodedWithoutVerify?.organization_id,
        organization_id_value: decodedWithoutVerify?.organization_id || null,
        user_id: decodedWithoutVerify?.id,
        user_email: decodedWithoutVerify?.email,
        user_role: decodedWithoutVerify?.role,
        issued_at: decodedWithoutVerify?.iat ? new Date(decodedWithoutVerify.iat * 1000).toISOString() : null,
        expires_at: decodedWithoutVerify?.exp ? new Date(decodedWithoutVerify.exp * 1000).toISOString() : null
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
