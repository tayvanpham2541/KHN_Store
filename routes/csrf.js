const express = require("express");

const router = express.Router();

router.get("/csrf-token", (req, res) => {
    res.json({
        csrfToken: req.session.csrfToken
    });
});

module.exports = router;