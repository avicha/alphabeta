var boardHash = {};
var Board = function(row, column) {
    this.data = [];
    this.row = row;
    this.column = column;
    //棋局被搜索的优先级，影响到剪枝效率，相当于对权重的评估值
    this.w = 0;
    //下棋堆栈
    this.stack = [];
    for (var i = 0; i < row; i++) {
        this.data[i] = [];
        for (var j = 0; j < column; j++) {
            this.data[i][j] = Board.NONE;
        }
    }
};
Board.prototype.hash = function(sourceRadix, targetRadix) {
    var str = this.data.map(function(arr) {
        return arr.join('');
    }).join('');
    return parseInt(str, sourceRadix).toString(targetRadix);
};
Board.prototype.toString = function() {
    return this.data.map(function(data) {
        return data.toString();
    }).join('\n');
};
Board.prototype.put = function(row, column, type) {
    this.data[row][column] = type;
    this.currentRow = row;
    this.currentColumn = column;
    this.stack.push({
        row: row,
        column: column,
        type: type
    });
    return this;
};
Board.prototype.setData = function(data) {
    for (var i = 0; i < this.row; i++) {
        for (var j = 0; j < this.column; j++) {
            this.data[i][j] = data[i][j];
        }
    }
    return this;
};
Board.prototype.clone = function() {
    var clone = new Board(this.row, this.column);
    clone.setData(this.data);
    clone.stack = [];
    _.each(this.stack, function(p) {
        clone.stack.push(p);
    });
    return clone;
};
Board.prototype.getNearPoints = function(p) {
    var points = [],
        row, column;
    for (var i = -2; i <= 4; i++) {
        row = p.row + i;
        column = p.column + i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        row = p.row + i;
        column = p.column - i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        row = p.row - i;
        column = p.column + i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        row = p.row - i;
        column = p.column - i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        row = p.row;
        column = p.column - i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        row = p.row - i;
        column = p.column;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
    }
    return points;
};
Board.prototype.isValid = function(row, column) {
    return row >= 0 && row < this.row && column >= 0 && column < this.column && !this.data[row][column];
};
Board.prototype.availableBoards = function(type) {
    // console.time('availableBoards');
    var availableBoards = [],
        row = this.row,
        column = this.column,
        stackLen = this.stack.length,
        board,
        centerRow = Math.floor((row - 1) / 2),
        centerColumn = Math.floor((column - 1) / 2);
    if (!stackLen || (stackLen == 1 && this.data[centerRow][centerColumn] == Board.NONE)) {
        board = this.clone();
        board.nextRow = centerRow;
        board.nextColumn = centerColumn;
        board.put(centerRow, centerColumn, type);
        availableBoards.push(board);
        return availableBoards;
    } else {
        if (stackLen == 1) {
            board = this.clone();
            var nextRow = centerRow + (Math.random() < 0.5 ? -1 : 1),
                nextColumn = centerColumn + (Math.random() < 0.5 ? -1 : 1);
            board.nextRow = nextRow;
            board.nextColumn = nextColumn;
            board.put(nextRow, nextColumn, type);
            availableBoards.push(board);
            return availableBoards;
        } else {
            var points = [];
            _.each(this.stack, function(p) {
                points = points.concat(this.getNearPoints(p));
            }, this);
            points = _.uniq(points, function(p) {
                return p.row + '#' + p.column;
            });
            _.each(points, function(p) {
                board = this.clone();
                board.put(p.row, p.column, type);
                board.nextRow = p.row;
                board.nextColumn = p.column;
                availableBoards.push(board);
            }, this);
            // for (var i = 0; i < row; i++) {
            //     for (var j = 0; j < column; j++) {
            //         if (!this.data[i][j]) {
            //             board = this.clone();
            //             board.put(i, j, type);
            //             board.nextRow = i;
            //             board.nextColumn = j;
            //             board.w = Math.pow(i - (row - 1) / 2, 2) + Math.pow(j - (column - 1) / 2, 2);
            //             availableBoards.push(board);
            //         }
            //     }
            // }
            // availableBoards.sort(function(a, b) {
            //     return a.w - b.w;
            // });
            // console.timeEnd('availableBoards');
            return availableBoards;
        }
    }
};
Board.prototype.analyseMax = function(data, type) {
    switch (type) {
        case Board.FIVE_TYPE:
            return ~data.indexOf('11111') ? 1 : 0;
        case Board.SFOUR_TYPE:
            if (~data.indexOf('011110')) {
                return 1;
            }
            return 0;
        case Board.FOUR_TYPE:
            var c = 0;
            var res1 = data.match(/211110/g);
            var res2 = data.match(/011112/g);
            var res3 = data.match(/10111/g);
            var res4 = data.match(/11011/g);
            var res5 = data.match(/11101/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            c += (res4 ? res4.length : 0);
            c += (res5 ? res5.length : 0);
            return c;
        case Board.STHREE_TYPE:
            var c = 0;
            var res1 = data.match(/01110/g);
            var res2 = data.match(/011010/g);
            var res3 = data.match(/010110/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Board.THREE_TYPE:
            var c = 0;
            var res1 = data.match(/211100/g);
            var res2 = data.match(/001112/g);
            var res3 = data.match(/211010/g);
            var res4 = data.match(/010112/g);
            var res5 = data.match(/210110/g);
            var res6 = data.match(/011012/g);
            var res7 = data.match(/10011/g);
            var res8 = data.match(/11001/g);
            var res9 = data.match(/10101/g);
            var res10 = data.match(/2011102/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            c += (res4 ? res4.length : 0);
            c += (res5 ? res5.length : 0);
            c += (res6 ? res6.length : 0);
            c += (res7 ? res7.length : 0);
            c += (res8 ? res8.length : 0);
            c += (res9 ? res9.length : 0);
            c += (res10 ? res10.length : 0);
            return c;
        case Board.STWO_TYPE:
            var c = 0;
            var res1 = data.match(/001100/g);
            var res2 = data.match(/01010/g);
            var res3 = data.match(/010010/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Board.TWO_TYPE:
            var c = 0;
            var res1 = data.match(/001100/g);
            var res2 = data.match(/01010/g);
            var res3 = data.match(/010010/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        default:
            return 0;
    }
};
Board.prototype.analyseMin = function(data, type) {
    switch (type) {
        case Board.FIVE_TYPE:
            return ~data.indexOf('22222') ? 1 : 0;
        case Board.SFOUR_TYPE:
            if (~data.indexOf('022220')) {
                return 1;
            }
            return 0;
        case Board.FOUR_TYPE:
            var c = 0;
            var res1 = data.match(/122220/g);
            var res2 = data.match(/022221/g);
            var res3 = data.match(/20222/g);
            var res4 = data.match(/22022/g);
            var res5 = data.match(/22202/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            c += (res4 ? res4.length : 0);
            c += (res5 ? res5.length : 0);
            return c;
        case Board.STHREE_TYPE:
            var c = 0;
            var res1 = data.match(/02220/g);
            var res2 = data.match(/022020/g);
            var res3 = data.match(/020220/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Board.THREE_TYPE:
            var c = 0;
            var res1 = data.match(/122200/g);
            var res2 = data.match(/002221/g);
            var res3 = data.match(/122020/g);
            var res4 = data.match(/020221/g);
            var res5 = data.match(/120220/g);
            var res6 = data.match(/022021/g);
            var res7 = data.match(/20022/g);
            var res8 = data.match(/22002/g);
            var res9 = data.match(/20202/g);
            var res10 = data.match(/1022201/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            c += (res4 ? res4.length : 0);
            c += (res5 ? res5.length : 0);
            c += (res6 ? res6.length : 0);
            c += (res7 ? res7.length : 0);
            c += (res8 ? res8.length : 0);
            c += (res9 ? res9.length : 0);
            c += (res10 ? res10.length : 0);
            return c;
        case Board.STWO_TYPE:
            var c = 0;
            var res1 = data.match(/002200/g);
            var res2 = data.match(/02020/g);
            var res3 = data.match(/020020/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Board.TWO_TYPE:
            var c = 0;
            var res1 = data.match(/001100/g);
            var res2 = data.match(/01010/g);
            var res3 = data.match(/010010/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        default:
            return 0;
    }
};
Board.prototype.evaluate = function(nextTurn) {
    var maxW = minW = 0;
    var rowData = this.data.map(function(row) {
        return row.join('');
    }).join('#');
    var columnData = (function() {
        var s = '';
        for (var i = 0, n = this.column; i < n; i++) {
            for (var j = 0, m = this.row; j < m; j++) {
                s += this.data[j][i];
            }
            s += '#';
        }
        return s;
    }.bind(this))();
    var edgeData1 = (function() {
        var s = '';
        for (var i = 0, n = 2 * this.row - 1; i < n; i++) {
            for (var j = 0, m = this.row - Math.abs(this.row - 1 - i); j < m; j++) {
                s += this.data[i < this.row ? j : i + j - (this.row - 1)][i < this.row ? this.row - 1 - i + j : j];
            }
            s += '#';
        }
        return s;
    }.bind(this))();
    var edgeData2 = (function() {
        var s = '';
        for (var i = 0, n = 2 * this.row - 1; i < n; i++) {
            for (var j = 0, m = this.row - Math.abs(this.row - 1 - i); j < m; j++) {
                s += this.data[i < this.row ? i - j : this.row - 1 - j][i < this.row ? j : i - (this.row - 1) + j];
            }
            s += '#';
        }
        return s;
    }.bind(this))();
    // console.log(rowData);
    // console.log(columnData);
    // console.log(edgeData1);
    // console.log(edgeData2);
    var maxFive = minFive = false;
    if (this.analyseMax(rowData, Board.FIVE_TYPE) || this.analyseMax(columnData, Board.FIVE_TYPE) || this.analyseMax(edgeData1, Board.FIVE_TYPE) || this.analyseMax(edgeData2, Board.FIVE_TYPE)) {
        maxFive = true;
    }
    if (this.analyseMin(rowData, Board.FIVE_TYPE) || this.analyseMin(columnData, Board.FIVE_TYPE) || this.analyseMin(edgeData1, Board.FIVE_TYPE) || this.analyseMin(edgeData2, Board.FIVE_TYPE)) {
        minFive = true;
    }
    if (maxFive && (!minFive || nextTurn == Board.MAX)) {
        return Board.MAX_VALUE;
    }
    if (minFive && (!maxFive || nextTurn == Board.MIN)) {
        return Board.MIN_VALUE;
    }
    var maxSfour = minSfour = false;
    if (this.analyseMax(rowData, Board.SFOUR_TYPE) || this.analyseMax(columnData, Board.SFOUR_TYPE) || this.analyseMax(edgeData1, Board.SFOUR_TYPE) || this.analyseMax(edgeData2, Board.SFOUR_TYPE)) {
        maxSfour = true;
    }
    if (this.analyseMin(rowData, Board.SFOUR_TYPE) || this.analyseMin(columnData, Board.SFOUR_TYPE) || this.analyseMin(edgeData1, Board.SFOUR_TYPE) || this.analyseMin(edgeData2, Board.SFOUR_TYPE)) {
        minSfour = true;
    }
    if (maxSfour && (!minSfour || nextTurn == Board.MAX)) {
        return Board.MAX_VALUE - 1;
    }
    if (minSfour && (!maxSfour || nextTurn == Board.MIN)) {
        return Board.MIN_VALUE + 1;
    }
    var maxFourCount = minFourCount = 0;
    maxFourCount += this.analyseMax(rowData, Board.FOUR_TYPE) + this.analyseMax(columnData, Board.FOUR_TYPE) + this.analyseMax(edgeData1, Board.FOUR_TYPE) + this.analyseMax(edgeData2, Board.FOUR_TYPE);
    minFourCount += this.analyseMin(rowData, Board.FOUR_TYPE) + this.analyseMin(columnData, Board.FOUR_TYPE) + this.analyseMin(edgeData1, Board.FOUR_TYPE) + this.analyseMin(edgeData2, Board.FOUR_TYPE);
    if (maxFourCount >= 2 && !(minFourCount && nextTurn == Board.MIN)) {
        return Board.MAX_VALUE - 2;
    }
    if (minFourCount >= 2 && !(maxFourCount && nextTurn == Board.MAX)) {
        return Board.MIN_VALUE + 2;
    }
    maxW += maxFourCount * Board.FOUR_W;
    minW += minFourCount * Board.FOUR_W;
    var maxSThreeCount = minSThreeCount = 0;
    maxSThreeCount += this.analyseMax(rowData, Board.STHREE_TYPE) + this.analyseMax(columnData, Board.STHREE_TYPE) + this.analyseMax(edgeData1, Board.STHREE_TYPE) + this.analyseMax(edgeData2, Board.STHREE_TYPE);
    minSThreeCount += this.analyseMin(rowData, Board.STHREE_TYPE) + this.analyseMin(columnData, Board.STHREE_TYPE) + this.analyseMin(edgeData1, Board.STHREE_TYPE) + this.analyseMin(edgeData2, Board.STHREE_TYPE);
    maxW += maxSThreeCount * Board.STHREE_W;
    minW += minSThreeCount * Board.STHREE_W;
    var maxThreeCount = minThreeCount = 0;
    maxThreeCount += this.analyseMax(rowData, Board.THREE_TYPE) + this.analyseMax(columnData, Board.THREE_TYPE) + this.analyseMax(edgeData1, Board.THREE_TYPE) + this.analyseMax(edgeData2, Board.THREE_TYPE);
    minThreeCount += this.analyseMin(rowData, Board.THREE_TYPE) + this.analyseMin(columnData, Board.THREE_TYPE) + this.analyseMin(edgeData1, Board.THREE_TYPE) + this.analyseMin(edgeData2, Board.THREE_TYPE);
    maxW += maxThreeCount * Board.THREE_W;
    minW += minThreeCount * Board.THREE_W;
    var maxSTwoCount = minSTwoCount = 0;
    maxSTwoCount += this.analyseMax(rowData, Board.STWO_TYPE) + this.analyseMax(columnData, Board.STWO_TYPE) + this.analyseMax(edgeData1, Board.STWO_TYPE) + this.analyseMax(edgeData2, Board.STWO_TYPE);
    minSTwoCount += this.analyseMin(rowData, Board.STWO_TYPE) + this.analyseMin(columnData, Board.STWO_TYPE) + this.analyseMin(edgeData1, Board.STWO_TYPE) + this.analyseMin(edgeData2, Board.STWO_TYPE);
    maxW += maxSTwoCount * Board.STWO_W;
    minW += minSTwoCount * Board.STWO_W;
    var maxTwoCount = minTwoCount = 0;
    maxTwoCount += this.analyseMax(rowData, Board.TWO_TYPE) + this.analyseMax(columnData, Board.TWO_TYPE) + this.analyseMax(edgeData1, Board.TWO_TYPE) + this.analyseMax(edgeData2, Board.TWO_TYPE);
    minTwoCount += this.analyseMin(rowData, Board.TWO_TYPE) + this.analyseMin(columnData, Board.TWO_TYPE) + this.analyseMin(edgeData1, Board.TWO_TYPE) + this.analyseMin(edgeData2, Board.TWO_TYPE);
    maxW += maxTwoCount * Board.TWO_W;
    minW += minTwoCount * Board.TWO_W;
    return maxW - minW;
};
var max = function(currentBoard, depth, beta) {
    var w, maxBoard, alpha = -Infinity,
        res;
    var hash = currentBoard.hash();
    var cache = boardHash[hash + depth];
    // if (cache) {
    //     if (cache.row != undefined && cache.column != undefined) {
    //         currentBoard.put(cache.row, cache.column, Board.MAX);
    //     }
    //     return cache;
    // }
    if (!depth) {
        w = currentBoard.evaluate(Board.MAX);
        res = {
            w: w
        };
        boardHash[hash + depth] = res;
        return res;
    } else {
        var boards = currentBoard.availableBoards(Board.MAX);
        if (depth > 1 && boards.length > 10) {
            _.each(boards, function(board) {
                board.w = board.evaluate(Board.MIN);
            });
            boards = _.sortBy(boards, function(board) {
                return -board.w;
            }).slice(0, 10);
        }
        for (var i = 0, l = boards.length; i < l; i++) {
            var board = boards[i];
            board.f = min(board, depth - 1, alpha).w;
            if (board.f > alpha) {
                alpha = board.f;
                maxBoard = board;
            }
            if (alpha == Board.MAX_VALUE || alpha >= beta) {
                // console.log('MAX节点' + l + '个棋局，剪掉了' + (l - 1 - i) + '个MIN棋局');
                break;
            }
        }
        if (maxBoard) {
            currentBoard.put(maxBoard.nextRow, maxBoard.nextColumn, Board.MAX);
            res = {
                w: alpha,
                is_ended: false,
                is_win: alpha == Board.MAX_VALUE ? true : false,
                row: maxBoard.nextRow,
                column: maxBoard.nextColumn
            };
            boardHash[hash + depth] = res;
            return res;
        } else {
            w = currentBoard.evaluate();
            res = {
                w: w,
                is_ended: true,
                is_win: w == Board.MAX_VALUE ? true : false
            };
            boardHash[hash + depth] = res;
            return res;
        }
    }
};
/**
 * [min min方下棋]
 * @param  {[type]} currentBoard [当前棋局]
 * @param  {[type]} depth        [看到的下棋步数，1代表只看到这一步的优势，2代表看到自己下棋之后，max再下一步的优势]
 * @param  {[type]} alpha        [max上一步棋已知至少能获得alpha优势]
 * @return {[type]}              [description]
 */
var min = function(currentBoard, depth, alpha) {
    var w, minBoard, beta = Infinity,
        res;
    var hash = currentBoard.hash();
    // var cache = boardHash[hash + depth];
    // if (cache) {
    //     if (cache.row != undefined && cache.column != undefined) {
    //         currentBoard.put(cache.row, cache.column, Board.MIN);
    //     }
    //     return cache;
    // }
    if (!depth) {
        w = currentBoard.evaluate(Board.MIN);
        res = {
            w: w
        };
        boardHash[hash + depth] = res;
        return res;
    } else {
        //min可以下的棋局
        var boards = currentBoard.availableBoards(Board.MIN);
        if (depth > 1 && boards.length > 10) {
            _.each(boards, function(board) {
                board.w = board.evaluate(Board.MAX);
            });
            boards = _.sortBy(boards, 'w').slice(0, 10);
        }
        //找出对min优势最大的棋局
        for (var i = 0, l = boards.length; i < l; i++) {
            var board = boards[i];
            board.f = max(board, depth - 1, beta).w;
            // console.log(board.nextRow, board.nextColumn, board.f);
            if (board.f < beta) {
                beta = board.f;
                minBoard = board;
            }
            //如果min必胜或者max下某步棋能够最小赢alpha，现在max这一步却只能使自己最多赢beta，那么肯定不会选择下这一步棋，所以可以剪掉多余的搜索
            if (beta == Board.MIN_VALUE || beta <= alpha) {
                // console.log('MIN节点' + l + '个棋局，剪掉了' + (l - 1 - i) + '个MAX棋局');
                break;
            }
        }
        //如果还有棋子可以下，必然有最优的棋局，下棋
        if (minBoard) {
            currentBoard.put(minBoard.nextRow, minBoard.nextColumn, Board.MIN);
            res = {
                w: beta,
                is_ended: false,
                is_win: beta == Board.MIN_VALUE ? true : false,
                row: minBoard.nextRow,
                column: minBoard.nextColumn
            };
            boardHash[hash + depth] = res;
            return res;
        } else {
            w = currentBoard.evaluate(Board.MIN);
            res = {
                w: w,
                is_ended: true,
                is_win: w == Board.MIN_VALUE ? true : false
            };
            boardHash[hash + depth] = res;
            return res;
        }
    }
};
Board.NONE = 0;
Board.MAX = 1;
Board.MIN = 2;
Board.FIVE_TYPE = 1;
Board.SFOUR_TYPE = 2;
Board.FOUR_TYPE = 3;
Board.STHREE_TYPE = 4;
Board.THREE_TYPE = 5;
Board.STWO_TYPE = 6;
Board.TWO_TYPE = 7;
Board.MAX_VALUE = 10000;
Board.MIN_VALUE = -10000;
Board.FIVE_W = 10000;
Board.SFOUR_W = 5000;
Board.FOUR_W = 2000;
Board.STHREE_W = 500;
Board.THREE_W = 200;
Board.STWO_W = 50;
Board.TWO_W = 20;