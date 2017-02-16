import * as chai from 'chai';
import * as microtime from 'microtime';
import {orderService, placeOrder, cancelOrder, displaySummary, ORDER_TYPE_SELL, ORDER_TYPE_BUY} from '../src/main';


describe('Silver Bars', function () {

    beforeEach(function () {
        orderService.clear();
    });

    describe('Orders Registration', function () {

        it('should register orders', function () {
            // Given
            // When
            placeOrder('myFirstOrder', '3.5', '303', ORDER_TYPE_BUY);

            // Then
            chai.expect(orderService.get('myFirstOrder')).to.deep.equal({
                quantity: '3.5',
                price: '303',
                type: ORDER_TYPE_BUY
            });
        });

        [
            {test: 'All fields', id: undefined, quantity: undefined, price: undefined, type: undefined},
            {test: 'type', id: 'userA', quantity: '3.5', price: '303', type: undefined},
            {test: 'price', id: 'userB', quantity: '3.5', price: undefined, type: ORDER_TYPE_BUY},
            {test: 'quantity', id: 'userC', quantity: undefined, price: '303', type: ORDER_TYPE_BUY},
            {test: 'id', id: undefined, quantity: '3.5', price: '303', type: ORDER_TYPE_SELL},

        ].forEach(function (scenario) {
            it('should fail to register orders with missing ' + scenario.test, function () {
                // Given scenario
                // When
                chai.expect(placeOrder.bind(this, scenario.id, scenario.quantity, scenario.price, scenario.type)).to.throw('Order has missing information');

                // Then
                chai.expect(orderService.has(scenario.id)).to.be.false;
            });
        });
    });

    describe('Order Cancellation', function () {

        it('should Cancel a registered order and remove from the live orders', function () {
            // Given
            orderService.set('oldOrder', {
                someorder: 'some data'
            });

            // When
            cancelOrder('oldOrder');

            // Then
            chai.expect(orderService.has('oldOrder')).to.be.false;
        });

        it('should not Cancel a registered order if it is not found', function () {
            // Given
            orderService.set('newOrder', {
                someorder: 'some data'
            });

            // When
            cancelOrder('weDontHaveThis');

            // Then
            chai.expect(orderService.has('newOrder')).to.be.true;
        });

        it('should fail if no id sent to cancel', function () {
            // Given
            orderService.set('missingOrder', {
                someorder: 'some data'
            });

            // When
            chai.expect(cancelOrder.bind(this)).to.throw('Missing order id');

            // Then
            chai.expect(orderService.has('missingOrder')).to.be.true;
        });
    });

    describe('Summary of Orders', function () {

        it('should display and summary of all SELL orders in the correct format', function () {
            // Given
            orderService.set('user1', {quantity: 3.5, price: 306, type: ORDER_TYPE_SELL});
            orderService.set('user2', {quantity: 1.2, price: 310, type: ORDER_TYPE_SELL});
            orderService.set('user3', {quantity: 1.5, price: 307, type: ORDER_TYPE_SELL});
            orderService.set('user4', {quantity: 2.0, price: 306, type: ORDER_TYPE_SELL});

            // When
            let summary = displaySummary();

            chai.expect(summary).to.deep.equal([
                {price: 306, quantity: 5.5, type: 'SELL'},
                {price: 307, quantity: 1.5, type: 'SELL'},
                {price: 310, quantity: 1.2, type: 'SELL'}
            ])
        });

        it('should display and summary of all BUY orders in the correct format', function () {
            // Given
            orderService.set('user1', {quantity: 3.5, price: 306, type: ORDER_TYPE_BUY});
            orderService.set('user2', {quantity: 1.2, price: 310, type: ORDER_TYPE_BUY});
            orderService.set('user3', {quantity: 1.5, price: 307, type: ORDER_TYPE_BUY});
            orderService.set('user4', {quantity: 2.0, price: 306, type: ORDER_TYPE_BUY});

            // When
            let summary = displaySummary();

            chai.expect(summary).to.deep.equal([
                {price: 310, quantity: 1.2, type: 'BUY'},
                {price: 307, quantity: 1.5, type: 'BUY'},
                {price: 306, quantity: 5.5, type: 'BUY'}
            ])
        });

        it('should display a summary of all SELL order before BUY orders', function () {
            // Given
            orderService.set('user1', {quantity: 3.5, price: 306, type: ORDER_TYPE_BUY});
            orderService.set('user2', {quantity: 1.2, price: 310, type: ORDER_TYPE_SELL});
            orderService.set('user3', {quantity: 1.5, price: 307, type: ORDER_TYPE_BUY});
            orderService.set('user4', {quantity: 2.0, price: 306, type: ORDER_TYPE_SELL});

            // When
            let summary = displaySummary();

            chai.expect(summary).to.deep.equal([
                {price: 306, quantity: 2.0, type: 'SELL'},
                {price: 310, quantity: 1.2, type: 'SELL'},
                {price: 307, quantity: 1.5, type: 'BUY'},
                {price: 306, quantity: 3.5, type: 'BUY'}
            ])
        });
    });

    describe('Benchmark', function () {

        it('should run summary and calculate performance', function () {
            // Given
            // let buildStart = new Date();
            // let hrBuildStart = process.hrtime();

            for(let i=0; i<=1000; i++) {
                orderService.set('userA' + i, {quantity: '1.5', price: '305', type: ORDER_TYPE_SELL});
                orderService.set('userB' + i, {quantity: '2', price: '305', type: ORDER_TYPE_SELL});
                orderService.set('userC' + i, {quantity: '1.5', price: '310', type: ORDER_TYPE_SELL});
                orderService.set('userD' + i, {quantity: '1.5', price: '308', type: ORDER_TYPE_SELL});
            }
            // let buildEnd = new Date() - buildStart;
            // let hrBuildEnd = process.hrtime(hrBuildStart);
            //
            // console.info("Build Execution time: %dms", buildEnd);
            // console.info("Build Execution time (hr): %ds %dms", hrBuildEnd[0], hrBuildEnd[1]/1000000);

            // When
            let summaryStart = new Date();
            let hrSummaryStart = process.hrtime();

            let summary = displaySummary();

            let summaryEnd = new Date() - summaryStart;
            let hrSummaryEnd = process.hrtime(hrSummaryStart);

            // Then
            console.info('Summary length %dx positions from %d separate orders', summary.length, orderService.size);
            console.info("Summary Execution time: %dms", summaryEnd);
            console.info("Summary Execution time (hi-res): %ds %dms", hrSummaryEnd[0], hrSummaryEnd[1]/1000000);
        })
    })
});