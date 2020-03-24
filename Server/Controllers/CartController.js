const { Cart, User, Product } = require('../models');

class CartController {
    static getAll(req, res, next){
        let UserId = Number(req.userData.id);
        Cart.findAll({where: {UserId}, include: Product})
        .then(carts => {
            res.status(200).json({carts})
        })
        .catch(err => {
            console.log(err, '<< dari get carts');
            next({status: 500, msg: 'Server Error'})
        })
    }
    static addCart(req, res, next){
        let UserId = Number(req.userData.id);
        let amount = Number(req.body.amount);
        let ProductId = Number(req.body.ProductId);
        let total_price = null;
        Product.findByPk(ProductId)
        .then(product => {
            if(product){
                total_price = amount * Number(product.price);
                let stock = Number(product.stock) - amount;
                if (stock < 0){
                    next({status: 400, msg: `Not enough stock`})
                }else{
                    let updatedProduct = {
                        name: product.name,
                        image_url: product.image_url,
                        price: product.price,
                        stock,
                    }
                    return Product.update(updatedProduct, {where: {id: product.id}})
                }
            }else{
                next({status: 404, msg: 'Product not found'})
            }
        })
        .then(updated => {
            if(updated) {
                return Cart.create({
                    amount, total_price, UserId, ProductId
                }, {include: Product})
            }
        })
        .then(createdCart => {
            if(createdCart){
                res.status(201).json({createdCart})
            }
        })
        .catch(err => {
            console.log(err, '<<< dari create cart');
            next({status: 500, msg: 'Server Error'})
        })
    }
}

module.exports = CartController