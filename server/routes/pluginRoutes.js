const express = require('express');
const { init, insertLog } = require('../controller/pluginController');
const router = express.Router();
const { check } = require('express-validator')

router.post(
    '/init',
    [
    ],
    init
)

router.post(
    '/log',
    [
        check('status', "Status is required.").exists(),
        check('tool', "tool is required.").exists()
    ],
    insertLog
)

module.exports = router;