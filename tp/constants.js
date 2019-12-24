var { _hash } = require('./lib');

const TP_FAMILY = 'voting_system';
exports.TP_FAMILY = TP_FAMILY;
exports.TP_NAMESPACE = _hash(TP_FAMILY).substring(0, 6);
