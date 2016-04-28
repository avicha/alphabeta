/**
 * [Chessboard 棋盘]
 * @param {[type]} row    [description]
 * @param {[type]} column [description]
 */
var Chessboard = function(row, column) {
    this.data = [];
    this.row = row;
    this.column = column;
    //赢法数组
    this.wins = [];
    //赢法数
    this.count = 0;
    //记录max每一种赢法的已经达成棋子数
    this.maxWin = [];
    //记录min每一种赢法的已经达成棋子数
    this.minWin = [];
    //初始化棋盘，顺便初始化赢法数组
    for (var i = 0; i < row; i++) {
        this.data[i] = [];
        this.wins[i] = [];
        for (var j = 0; j < column; j++) {
            this.data[i][j] = Chessboard.NONE;
            this.wins[i][j] = [];
        }
    }
    //横向赢法
    for (var i = 0; i < row; i++) {
        for (var j = 0; j <= column - 5; j++) {
            for (var k = 0; k < 5; k++) {
                this.wins[i][j + k][this.count] = true;
            }
            this.count++;
        }
    }
    //纵向赢法
    for (var i = 0; i < column; i++) {
        for (var j = 0; j <= row - 5; j++) {
            for (var k = 0; k < 5; k++) {
                this.wins[j + k][i][this.count] = true;
            }
            this.count++;
        }
    }
    //右斜线的赢法
    for (var i = 0; i <= row - 5; i++) {
        for (var j = 0; j <= column - 5; j++) {
            for (var k = 0; k < 5; k++) {
                this.wins[i + k][j + k][this.count] = true;
            }
            this.count++;
        }
    }
    //左斜线的赢法
    for (var i = 0; i <= row - 5; i++) {
        for (var j = column - 1; j >= 4; j--) {
            for (var k = 0; k < 5; k++) {
                this.wins[i + k][j - k][this.count] = true;
            }
            this.count++;
        }
    }
    //初始化max和min每一种赢法的下子情况
    for (var i = 0; i < this.count; i++) {
        this.maxWin[i] = {
            max: 0,
            min: 0
        };
        this.minWin[i] = {
            min: 0,
            max: 0
        };
    }
    //下棋记录堆栈
    this.stack = [];
    //游戏是否结束
    this.is_ended = false;
};
/**
 * [toString 输出棋盘信息]
 * @return {[type]} [description]
 */
Chessboard.prototype.toString = function() {
    return this.data.map(function(data) {
        return data.toString();
    }).join('\n');
};
/**
 * 返回当前最新一步下的棋子
 * @return {[type]}
 */
Chessboard.prototype.current = function() {
    var l = this.stack.length;
    if (l) {
        return this.stack[l - 1];
    }
};
/**
 * [put 下棋]
 * @param  {[type]} row    [行]
 * @param  {[type]} column [列]
 * @param  {[type]} type   [人还是AI下棋]
 * @return {[type]}        [description]
 */
Chessboard.prototype.put = function(row, column, type) {
    if (this.data[row][column] == Chessboard.NONE) {
        this.data[row][column] = type;
        //放进记录堆栈
        this.stack.push({
            row: row,
            column: column,
            type: type
        });
        //下棋之后对每一种赢法的下棋情况进行更新
        for (var i = 0; i < this.count; i++) {
            if (this.wins[row][column][i]) {
                if (type == Chessboard.MAX) {
                    this.maxWin[i].max++;
                    this.minWin[i].max++;
                } else {
                    this.minWin[i].min++;
                    this.maxWin[i].min++;
                }
            }
        }
        //如果下子满了则结束游戏
        if (this.stack.length == this.row * this.column) {
            this.end();
        }
    }
    return this;
};
/**
 * [rollback 悔棋]
 * @param  {[type]} n [后退n步]
 * @return {[type]}   [description]
 */
Chessboard.prototype.rollback = function(n) {
    //记录后退的n步走法
    var steps = [];
    n = n || 1;
    for (var i = 0; i < n; i++) {
        var step = this.stack.pop();
        if (step) {
            steps.push(step);
            var row = step.row,
                column = step.column,
                type = step.type;
            //置空格点
            this.data[row][column] = Chessboard.NONE;
            //更新每一种赢法的下子情况
            for (var j = 0; j < this.count; j++) {
                if (this.wins[row][column][j]) {
                    if (type == Chessboard.MAX) {
                        this.maxWin[j].max--;
                        this.minWin[j].max--;
                    } else {
                        this.minWin[j].min--;
                        this.maxWin[j].min--;
                    }
                }
            }
        }
    }
    this.is_ended = false;
    return steps;
};
/**
 * 获取当前点附近考虑的下棋位置
 * @param  {[p这个点]}
 * @return {[type]}
 */
Chessboard.prototype.getNearPoints = function(p) {
    var points = [],
        row, column;
    for (var i = -2; i <= 2; i++) {
        //右下角
        row = p.row + i;
        column = p.column + i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        //左上角
        row = p.row - i;
        column = p.column + i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        //行
        row = p.row;
        column = p.column - i;
        if (this.isValid(row, column)) {
            points.push({
                row: row,
                column: column
            });
        }
        //列
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
//该位置是否合法
Chessboard.prototype.isValid = function(row, column) {
    return row >= 0 && row < this.row && column >= 0 && column < this.column && this.data[row][column] == Chessboard.NONE;
};
/**
 * [availableSteps 获取可走的位置]
 * @return {[type]} [description]
 */
Chessboard.prototype.availableSteps = function() {
    var availableSteps = [],
        row = this.row,
        column = this.column,
        stackLen = this.stack.length,
        centerRow = Math.floor((row - 1) / 2),
        centerColumn = Math.floor((column - 1) / 2);
    if (!stackLen || (stackLen == 1 && this.data[centerRow][centerColumn] == Chessboard.NONE)) {
        availableSteps.push({
            row: centerRow,
            column: centerColumn
        });
        return availableSteps;
    } else {
        if (stackLen == 1) {
            var nextRow = centerRow + (Math.random() < 0.5 ? -1 : 1),
                nextColumn = centerColumn + (Math.random() < 0.5 ? -1 : 1);
            availableSteps.push({
                row: nextRow,
                column: nextColumn
            });
            return availableSteps;
        } else {
            var hash = {};
            this.stack.forEach(function(p) {
                nearPoints = this.getNearPoints(p);
                nearPoints.forEach(function(nearPoint) {
                    var row = nearPoint.row,
                        column = nearPoint.column;
                    if (!hash[row + '#' + column]) {
                        availableSteps.push(nearPoint);
                        hash[row + '#' + column] = true;
                    }
                });
            }.bind(this));
            return availableSteps;
        }
    }
    return availableSteps;
};
Chessboard.prototype.analyseMax = function(data, type) {
    switch (type) {
        case Chessboard.FIVE_TYPE:
            return ~data.indexOf('11111') ? 1 : 0;
        case Chessboard.SFOUR_TYPE:
            if (~data.indexOf('011110')) {
                return 1;
            }
            return 0;
        case Chessboard.FOUR_TYPE:
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
        case Chessboard.STHREE_TYPE:
            var c = 0;
            var res1 = data.match(/01110/g);
            var res2 = data.match(/011010/g);
            var res3 = data.match(/010110/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Chessboard.THREE_TYPE:
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
        case Chessboard.STWO_TYPE:
            var c = 0;
            var res1 = data.match(/001100/g);
            var res2 = data.match(/01010/g);
            var res3 = data.match(/010010/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Chessboard.TWO_TYPE:
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
Chessboard.prototype.analyseMin = function(data, type) {
    switch (type) {
        case Chessboard.FIVE_TYPE:
            return ~data.indexOf('22222') ? 1 : 0;
        case Chessboard.SFOUR_TYPE:
            if (~data.indexOf('022220')) {
                return 1;
            }
            return 0;
        case Chessboard.FOUR_TYPE:
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
        case Chessboard.STHREE_TYPE:
            var c = 0;
            var res1 = data.match(/02220/g);
            var res2 = data.match(/022020/g);
            var res3 = data.match(/020220/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Chessboard.THREE_TYPE:
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
        case Chessboard.STWO_TYPE:
            var c = 0;
            var res1 = data.match(/002200/g);
            var res2 = data.match(/02020/g);
            var res3 = data.match(/020020/g);
            c += (res1 ? res1.length : 0);
            c += (res2 ? res2.length : 0);
            c += (res3 ? res3.length : 0);
            return c;
        case Chessboard.TWO_TYPE:
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
/**
 * [evaluate 计算当前棋盘的估值]
 * @return {[type]} [description]
 */
Chessboard.prototype.evaluate = function() {
    var maxW = minW = 0;
    // var rowData = this.data.map(function(row) {
    //     return row.join('');
    // }).join('#');
    // var columnData = (function() {
    //     var s = '';
    //     for (var i = 0, n = this.column; i < n; i++) {
    //         for (var j = 0, m = this.row; j < m; j++) {
    //             s += this.data[j][i];
    //         }
    //         s += '#';
    //     }
    //     return s;
    // }.bind(this))();
    // var edgeData1 = (function() {
    //     var s = '';
    //     for (var i = 0, n = 2 * this.row - 1; i < n; i++) {
    //         for (var j = 0, m = this.row - Math.abs(this.row - 1 - i); j < m; j++) {
    //             s += this.data[i < this.row ? j : i + j - (this.row - 1)][i < this.row ? this.row - 1 - i + j : j];
    //         }
    //         s += '#';
    //     }
    //     return s;
    // }.bind(this))();
    // var edgeData2 = (function() {
    //     var s = '';
    //     for (var i = 0, n = 2 * this.row - 1; i < n; i++) {
    //         for (var j = 0, m = this.row - Math.abs(this.row - 1 - i); j < m; j++) {
    //             s += this.data[i < this.row ? i - j : this.row - 1 - j][i < this.row ? j : i - (this.row - 1) + j];
    //         }
    //         s += '#';
    //     }
    //     return s;
    // }.bind(this))();
    // if (this.analyseMax(rowData, Chessboard.FIVE_TYPE) || this.analyseMax(columnData, Chessboard.FIVE_TYPE) || this.analyseMax(edgeData1, Chessboard.FIVE_TYPE) || this.analyseMax(edgeData2, Chessboard.FIVE_TYPE)) {
    //     return Chessboard.MAX_VALUE;
    // }
    // if (this.analyseMin(rowData, Chessboard.FIVE_TYPE) || this.analyseMin(columnData, Chessboard.FIVE_TYPE) || this.analyseMin(edgeData1, Chessboard.FIVE_TYPE) || this.analyseMin(edgeData2, Chessboard.FIVE_TYPE)) {
    //     return Chessboard.MIN_VALUE;
    // }
    // var maxSfour = minSfour = false;
    // if (this.analyseMax(rowData, Chessboard.SFOUR_TYPE) || this.analyseMax(columnData, Chessboard.SFOUR_TYPE) || this.analyseMax(edgeData1, Chessboard.SFOUR_TYPE) || this.analyseMax(edgeData2, Chessboard.SFOUR_TYPE)) {
    //     maxSfour = true;
    // }
    // if (this.analyseMin(rowData, Chessboard.SFOUR_TYPE) || this.analyseMin(columnData, Chessboard.SFOUR_TYPE) || this.analyseMin(edgeData1, Chessboard.SFOUR_TYPE) || this.analyseMin(edgeData2, Chessboard.SFOUR_TYPE)) {
    //     minSfour = true;
    // }
    // if (maxSfour && !minSfour) {
    //     return Chessboard.MAX_VALUE - 1;
    // }
    // if (minSfour && !maxSfour) {
    //     return Chessboard.MIN_VALUE + 1;
    // }
    // var maxFourCount = minFourCount = 0;
    // maxFourCount += this.analyseMax(rowData, Chessboard.FOUR_TYPE) + this.analyseMax(columnData, Chessboard.FOUR_TYPE) + this.analyseMax(edgeData1, Chessboard.FOUR_TYPE) + this.analyseMax(edgeData2, Chessboard.FOUR_TYPE);
    // minFourCount += this.analyseMin(rowData, Chessboard.FOUR_TYPE) + this.analyseMin(columnData, Chessboard.FOUR_TYPE) + this.analyseMin(edgeData1, Chessboard.FOUR_TYPE) + this.analyseMin(edgeData2, Chessboard.FOUR_TYPE);
    // if (maxFourCount >= 2 && !minFourCount) {
    //     return Chessboard.MAX_VALUE - 2;
    // }
    // if (minFourCount >= 2 && !maxFourCount) {
    //     return Chessboard.MIN_VALUE + 2;
    // }
    // maxW += maxFourCount * Chessboard.FOUR_W;
    // minW += minFourCount * Chessboard.FOUR_W;
    // var maxSThreeCount = minSThreeCount = 0;
    // maxSThreeCount += this.analyseMax(rowData, Chessboard.STHREE_TYPE) + this.analyseMax(columnData, Chessboard.STHREE_TYPE) + this.analyseMax(edgeData1, Chessboard.STHREE_TYPE) + this.analyseMax(edgeData2, Chessboard.STHREE_TYPE);
    // minSThreeCount += this.analyseMin(rowData, Chessboard.STHREE_TYPE) + this.analyseMin(columnData, Chessboard.STHREE_TYPE) + this.analyseMin(edgeData1, Chessboard.STHREE_TYPE) + this.analyseMin(edgeData2, Chessboard.STHREE_TYPE);
    // maxW += maxSThreeCount * Chessboard.STHREE_W;
    // minW += minSThreeCount * Chessboard.STHREE_W;
    // var maxThreeCount = minThreeCount = 0;
    // maxThreeCount += this.analyseMax(rowData, Chessboard.THREE_TYPE) + this.analyseMax(columnData, Chessboard.THREE_TYPE) + this.analyseMax(edgeData1, Chessboard.THREE_TYPE) + this.analyseMax(edgeData2, Chessboard.THREE_TYPE);
    // minThreeCount += this.analyseMin(rowData, Chessboard.THREE_TYPE) + this.analyseMin(columnData, Chessboard.THREE_TYPE) + this.analyseMin(edgeData1, Chessboard.THREE_TYPE) + this.analyseMin(edgeData2, Chessboard.THREE_TYPE);
    // maxW += maxThreeCount * Chessboard.THREE_W;
    // minW += minThreeCount * Chessboard.THREE_W;
    // var maxSTwoCount = minSTwoCount = 0;
    // maxSTwoCount += this.analyseMax(rowData, Chessboard.STWO_TYPE) + this.analyseMax(columnData, Chessboard.STWO_TYPE) + this.analyseMax(edgeData1, Chessboard.STWO_TYPE) + this.analyseMax(edgeData2, Chessboard.STWO_TYPE);
    // minSTwoCount += this.analyseMin(rowData, Chessboard.STWO_TYPE) + this.analyseMin(columnData, Chessboard.STWO_TYPE) + this.analyseMin(edgeData1, Chessboard.STWO_TYPE) + this.analyseMin(edgeData2, Chessboard.STWO_TYPE);
    // maxW += maxSTwoCount * Chessboard.STWO_W;
    // minW += minSTwoCount * Chessboard.STWO_W;
    // var maxTwoCount = minTwoCount = 0;
    // maxTwoCount += this.analyseMax(rowData, Chessboard.TWO_TYPE) + this.analyseMax(columnData, Chessboard.TWO_TYPE) + this.analyseMax(edgeData1, Chessboard.TWO_TYPE) + this.analyseMax(edgeData2, Chessboard.TWO_TYPE);
    // minTwoCount += this.analyseMin(rowData, Chessboard.TWO_TYPE) + this.analyseMin(columnData, Chessboard.TWO_TYPE) + this.analyseMin(edgeData1, Chessboard.TWO_TYPE) + this.analyseMin(edgeData2, Chessboard.TWO_TYPE);
    // maxW += maxTwoCount * Chessboard.TWO_W;
    // minW += minTwoCount * Chessboard.TWO_W;
    var maxGroup = {
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0
        },
        minGroup = {
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0
        };
    for (var i = 0; i < this.count; i++) {
        if (this.maxWin[i].max == 5 && !this.maxWin[i].min) {
            return Chessboard.MAX_VALUE;
        }
        if (this.minWin[i].min == 5 && !this.minWin[i].max) {
            return Chessboard.MIN_VALUE;
        }
        if (this.maxWin[i].max == 4 && !this.maxWin[i].min) {
            maxGroup[4]++;
        }
        if (this.minWin[i].min == 4 && !this.minWin[i].max) {
            minGroup[4]++;
        }
        if (this.maxWin[i].max == 3 && !this.maxWin[i].min) {
            maxGroup[3]++;
        }
        if (this.minWin[i].min == 3 && !this.minWin[i].max) {
            minGroup[3]++;
        }
        if (this.maxWin[i].max == 2 && !this.maxWin[i].min) {
            maxGroup[2]++;
        }
        if (this.minWin[i].min == 2 && !this.minWin[i].max) {
            minGroup[2]++;
        }
        if (this.maxWin[i].max == 1 && !this.maxWin[i].min) {
            maxGroup[1]++;
        }
        if (this.minWin[i].min == 1 && !this.minWin[i].max) {
            minGroup[1]++;
        }
    }
    maxW = maxGroup[4] * Chessboard.FOUR_W + maxGroup[3] * Chessboard.THREE_W + maxGroup[2] * Chessboard.TWO_W + maxGroup[1] * Chessboard.ONE_W;
    minW = minGroup[4] * Chessboard.FOUR_W + minGroup[3] * Chessboard.THREE_W + minGroup[2] * Chessboard.TWO_W + minGroup[1] * Chessboard.ONE_W;
    return maxW - minW;
};
/**
 * [isMaxWin 人是否赢了]
 * @return {Boolean} [description]
 */
Chessboard.prototype.isMaxWin = function() {
    var w = this.evaluate();
    return w == Chessboard.MAX_VALUE ? true : false;
};
/**
 * [isMinWin AI是否赢了]
 * @return {Boolean} [description]
 */
Chessboard.prototype.isMinWin = function() {
    var w = this.evaluate();
    return w == Chessboard.MIN_VALUE ? true : false;
};
/**
 * [end 结束游戏]
 * @return {[type]} [description]
 */
Chessboard.prototype.end = function() {
    this.is_ended = true;
    return this;
};
/**
 * [isEnded 游戏是否结束]
 * @return {Boolean} [description]
 */
Chessboard.prototype.isEnded = function() {
    return this.is_ended;
};
/**
 * [max max下棋]
 * @param  {[type]} currentChessboard [当前棋盘]
 * @param  {[type]} depth        [考虑深度]
 * @return {[type]}              [description]
 */
var max = function(currentChessboard, depth, beta) {
    //记录优势值，应该下棋的位置
    var row, column, alpha = -Infinity;
    //什么都不下，直接返回当前棋盘评估值
    if (depth == 0) {
        alpha = currentChessboard.evaluate();
        return {
            w: alpha
        };
    } else {
        //获取每一步可以走的方案
        var steps = currentChessboard.availableSteps();
        // console.log('搜索MAX' + steps.length + '个棋局');
        if (steps.length) {
            //对于每一种走法
            for (var i = 0, l = steps.length; i < l; i++) {
                var step = steps[i];
                //下棋
                currentChessboard.put(step.row, step.column, Chessboard.MAX);
                //如果已经赢了，则直接下棋，不再考虑对方下棋
                if (currentChessboard.isMaxWin()) {
                    alpha = Chessboard.MAX_VALUE;
                    row = step.row;
                    column = step.column;
                    //退回上一步下棋
                    currentChessboard.rollback();
                    break;
                } else {
                    //考虑对方depth-1步下棋之后的优势值，如果对方没棋可下了，则返回当前棋盘估值
                    var res = min(currentChessboard, depth - 1) || {
                        w: currentChessboard.evaluate()
                    };
                    //退回上一步下棋
                    currentChessboard.rollback();
                    if (res.w > alpha) {
                        //选择最大优势的走法
                        alpha = res.w;
                        row = step.row;
                        column = step.column;
                    }
                    //如果人可以获得更好的走法，则AI必然不会选择这一步走法，所以不用再考虑人的其他走法
                    if (alpha >= beta) {
                        // console.log('MAX节点' + l + '个棋局，剪掉了' + (l - 1 - i) + '个MIN棋局');
                        break;
                    }
                }

            }
            return {
                w: alpha,
                row: row,
                column: column
            };
        }
    }
};
/**
 * [min min下棋]
 * @param  {[type]} currentChessboard [当前棋盘]
 * @param  {[type]} depth        [考虑深度]
 * @return {[type]}              [权重和当前推荐下棋的位置]
 */
var min = function(currentChessboard, depth, alpha) {
    var row, column, beta = Infinity;
    if (depth == 0) {
        beta = currentChessboard.evaluate();
        return {
            w: beta
        };
    } else {
        //获取每一步可以走的方案
        var steps = currentChessboard.availableSteps();
        // console.log('搜索MIN' + steps.length + '个棋局');
        if (steps.length) {
            //对于每一种走法
            for (var i = 0, l = steps.length; i < l; i++) {
                var step = steps[i];
                //下棋
                currentChessboard.put(step.row, step.column, Chessboard.MIN);
                //如果已经赢了，则直接下棋，不再考虑对方下棋
                if (currentChessboard.isMinWin()) {
                    beta = Chessboard.MIN_VALUE;
                    row = step.row;
                    column = step.column;
                    //退回上一步下棋
                    currentChessboard.rollback();
                    break;
                } else {
                    //考虑对方depth-1步下棋之后的优势值，如果对方没棋可下了，则返回当前棋盘估值
                    var res = max(currentChessboard, depth - 1, beta) || {
                        w: currentChessboard.evaluate()
                    };
                    //退回上一步下棋
                    currentChessboard.rollback();
                    if (res.w < beta) {
                        //选择最大优势的走法
                        beta = res.w;
                        row = step.row;
                        column = step.column;
                    }
                    //如果AI可以获得更好的走法，则人必然不会选择这一步走法，所以不用再考虑AI的其他走法
                    if (beta <= alpha) {
                        // console.log('MIN节点' + l + '个棋局，剪掉了' + (l - 1 - i) + '个MAX棋局');
                        break;
                    }
                }
            }
            return {
                w: beta,
                row: row,
                column: column
            };
        }
    }
};
Chessboard.NONE = 0;
Chessboard.MAX = 1;
Chessboard.MIN = 2;
Chessboard.FIVE_TYPE = 1;
Chessboard.SFOUR_TYPE = 2;
Chessboard.FOUR_TYPE = 3;
Chessboard.STHREE_TYPE = 4;
Chessboard.THREE_TYPE = 5;
Chessboard.STWO_TYPE = 6;
Chessboard.TWO_TYPE = 7;
Chessboard.MAX_VALUE = 100000;
Chessboard.MIN_VALUE = -100000;
Chessboard.FIVE_W = 100000;
Chessboard.SFOUR_W = 10000;
Chessboard.FOUR_W = 5000;
Chessboard.STHREE_W = 2000;
Chessboard.THREE_W = 1000;
Chessboard.STWO_W = 500;
Chessboard.TWO_W = 200;
Chessboard.ONE_W = 10;