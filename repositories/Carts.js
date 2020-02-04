const Repository = require('./Repository');

class CartsRepository extends Repository {}

module.exports = new CartsRepository('carts.json');
