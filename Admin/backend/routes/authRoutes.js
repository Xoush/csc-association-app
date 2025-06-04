const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

// Route de connexion (login)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérifie les identifiants (admin/admin)
  if (username === 'admin' && password === 'admin') {
    // Génère un vrai token JWT
    const token = jwt.sign(
      { username: 'admin', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token valable 1 heure
    );

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Identifiants incorrects',
    });
  }
});

// Route protégée pour vérifier l'authentification
router.get('/check-auth', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Authentifié' });
});

module.exports = router;
