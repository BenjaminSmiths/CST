export const ORDER_TYPE_SELL = 'SELL';
export const ORDER_TYPE_BUY = 'BUY';

/**
 * Simulates the in memory Database.
 * @type {Map}
 */
export const orderService = new Map();

/**
 * Places an order into the database. Missing parameters will cause an Error to be thrown.
 * @param id
 * @param quantity
 * @param price
 * @param type
 */
export function placeOrder(id, quantity, price, type) {
    if (!id || !quantity || !price || !type) {
        throw Error('Order has missing information');
    }

    orderService.set(id, {
        quantity: quantity,
        price: price,
        type: type
    });

}

/**
 * Removes and order id from the orders database.
 * @param id
 */
export function cancelOrder(id) {
    if (id) {
        if (orderService.has(id)) {
            orderService.delete(id);
        } else {
            console.log('Could not find the order to remove.', id)
        }
    } else {
        throw Error('Missing order id');
    }
}

let sortByTypePrice = (a, b) => {
    if (a.type == ORDER_TYPE_SELL && b.type == ORDER_TYPE_SELL) {
        return a.price >= b.price
    } else if (a.type == ORDER_TYPE_BUY && b.type == ORDER_TYPE_BUY) {
        return a.price <= b.price
    } else if (a.type === ORDER_TYPE_SELL && b.type === ORDER_TYPE_BUY) {
        return false;
    } else if (a.type === ORDER_TYPE_BUY && b.type === ORDER_TYPE_SELL) {
        return true;
    }
};

let sumOfQuantitys = (a, b) => {
    let qA = parseFloat(a);
    let qB = parseFloat(b);
    return qA + qB;
};

let formatDisplay = (value) => {
    return `${value.type} ${value.quantity} kg for £${value.price}`;
};

/**
 * Show the summary of the Order book.
 * @returns {Array}
 */
export function displaySummary() {
    let summary = [];
    let uniquePositions = new Map();

    orderService.forEach((order) => {
        let lastPosition = uniquePositions.get(order.price + order.type);
        if (lastPosition) {
            // add the quantity
            lastPosition.quantity = sumOfQuantitys(lastPosition.quantity, order.quantity);
        } else {
            // add the new position
            uniquePositions.set(order.price + order.type, order);
        }
    });

    uniquePositions.forEach((pricePosition) => {
        summary.push({price: pricePosition.price, quantity: pricePosition.quantity, type: pricePosition.type});
    });

    return summary
        .sort(sortByTypePrice);
}