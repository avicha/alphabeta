/**
 * [Chessboard 棋盘]
 * @param {[type]} row    [description]
 * @param {[type]} column [description]
 */
var Chessboard = function(row, column) {
    this.data = [];
    this.row = row;
    this.column = column;
    for (var i = 0; i < row; i++) {
        this.data[i] = [];
        for (var j = 0; j < column; j++) {
            this.data[i][j] = Chessboard.NONE;
        }
    }
    this.stack = [];
    this.is_ended = false;
};
Chessboard.prototype.toString = function() {
    return this.data.map(function(data) {
        return data.toString();
    }).join('\n');
};
Chessboard.prototype.put = function(row, column, type) {
    if (this.data[row][column] == Chessboard.NONE) {
        this.data[row][column] = type;
        this.stack.push({
            row: row,
            column: column,
            type: type
        });
        if (this.stack.length == this.row * this.column) {
            this.is_ended = true;
        }
    }
    return this;
};
Chessboard.prototype.rollback = function(n) {
    n = n || 1;
    for (var i = 0; i < n; i++) {
        var step = this.stack.pop();
        if (step) {
            this.data[step.row][step.column] = Chessboard.NONE;
        }
    }
    this.is_ended = false;
    return this;
};
Chessboard.prototype.availableSteps = function() {
    var availableSteps = [];
    for (var i = 0, n = this.row; i < n; i++) {
        for (var j = 0, m = this.column; j < m; j++) {
            if (this.data[i][j] == Chessboard.NONE) {
                availableSteps.push({
                    row: i,
                    column: j
                });
            }
        }
    }
    return availableSteps;
};
Chessboard.prototype.evaluate = function() {
    //max，min权重，max连棋数，min连棋数
    var maxW = minW = 0,
        maxCount, minCount;
    //横向计算
    for (var i = 0; i < this.row; i++) {
        //当前这一行，max连棋数，min连棋数
        maxCount = minCount = 0;
        for (var j = 0; j < this.column; j++) {
            var type = this.data[i][j];
            if (type == Chessboard.MAX) {
                maxCount++;
            } else {
                if (type == Chessboard.MIN) {
                    minCount++;
                }
            }
        }
        //如果连成3子
        if (maxCount == 3) {
            return Infinity;
        } else {
            if (minCount == 3) {
                return -Infinity;
            } else {
                //如果没有max的棋子，则min可能连成3子
                if (!maxCount) {
                    minW++;
                }
                //如果没有min的棋子，则max可能连成3子
                if (!minCount) {
                    maxW++;
                }
            }
        }
    }
    //纵向计算
    for (var i = 0; i < this.column; i++) {
        //当前这一列，max连棋数，min连棋数
        maxCount = minCount = 0;
        for (var j = 0; j < this.row; j++) {
            var type = this.data[j][i];
            if (type == Chessboard.MAX) {
                maxCount++;
            } else {
                if (type == Chessboard.MIN) {
                    minCount++;
                }
            }
        }
        //如果连成3子
        if (maxCount == this.row) {
            return Infinity;
        } else {
            if (minCount == this.row) {
                return -Infinity;
            } else {
                //如果没有max的棋子，则min可能连成3子
                if (!maxCount) {
                    minW++;
                }
                //如果没有min的棋子，则max可能连成3子
                if (!minCount) {
                    maxW++;
                }
            }
        }
    }
    //右斜下方向计算
    maxCount = minCount = 0;
    for (var i = 0; i < this.column; i++) {
        var type = this.data[i][i];
        if (type == Chessboard.MAX) {
            maxCount++;

        } else {
            if (type == Chessboard.MIN) {
                minCount++;
            }
        }
    }
    //如果连成3子
    if (maxCount == this.row) {
        return Infinity;
    } else {
        if (minCount == this.row) {
            return -Infinity;
        } else {
            //如果没有max的棋子，则min可能连成3子
            if (!maxCount) {
                minW++;
            }
            //如果没有min的棋子，则max可能连成3子
            if (!minCount) {
                maxW++;
            }
        }
    }
    //左斜下方向计算
    maxCount = minCount = 0;
    for (var i = 0; i < this.column; i++) {
        var type = this.data[i][this.column - i - 1];
        if (type == Chessboard.MAX) {
            maxCount++;
        } else {
            if (type == Chessboard.MIN) {
                minCount++;
            }
        }
    }
    if (maxCount == this.row) {
        return Infinity;
    } else {
        if (minCount == this.row) {
            return -Infinity;
        } else {
            //如果没有max的棋子，则min可能连成3子
            if (!maxCount) {
                minW++;
            }
            //如果没有min的棋子，则max可能连成3子
            if (!minCount) {
                maxW++;
            }
        }
    }
    //返回双方实力差
    return maxW - minW;
};
Chessboard.prototype.isMaxWin = function() {
    var w = this.evaluate();
    return w == Infinity ? true : false;
};
Chessboard.prototype.isMinWin = function() {
    var w = this.evaluate();
    return w == -Infinity ? true : false;
};
Chessboard.prototype.end = function() {
    this.is_ended = true;
    return this;
};
Chessboard.prototype.isEnded = function() {
    return this.is_ended;
};
/**
 * [max max下棋]
 * @param  {[type]} currentChessboard [当前棋盘]
 * @param  {[type]} depth        [考虑深度]
 * @return {[type]}              [description]
 */
var max = function(currentChessboard, depth) {
    //记录优势值，应该下棋的位置
    var w, row, column;
    //什么都不下，直接返回当前棋盘评估值
    if (depth == 0) {
        w = currentChessboard.evaluate();
        return {
            w: w
        };
    } else {
        //获取每一步可以走的方案
        var steps = currentChessboard.availableSteps();
        // console.log('搜索MAX' + steps.length + '个棋局');
        if (steps.length) {
            w = -Infinity;
            //对于每一种走法
            for (var i = 0, l = steps.length; i < l; i++) {
                var step = steps[i];
                //下棋
                currentChessboard.put(step.row, step.column, Chessboard.MAX);
                //如果已经赢了，则直接下棋，不再考虑对方下棋
                if (currentChessboard.isMaxWin()) {
                    w = Infinity;
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
                    if (res.w > w) {
                        //选择最大优势的走法
                        w = res.w;
                        row = step.row;
                        column = step.column;
                    }
                    //退回上一步下棋
                    currentChessboard.rollback();
                }

            }
            return {
                w: w,
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
 * @return {[type]}              [description]
 */
var min = function(currentChessboard, depth) {
    var w, row, column;
    if (depth == 0) {
        w = currentChessboard.evaluate();
        return {
            w: w
        };
    } else {
        //获取每一步可以走的方案
        var steps = currentChessboard.availableSteps();
        // console.log('搜索MIN' + steps.length + '个棋局');
        if (steps.length) {
            w = Infinity;
            //对于每一种走法
            for (var i = 0, l = steps.length; i < l; i++) {
                var step = steps[i];
                //下棋
                currentChessboard.put(step.row, step.column, Chessboard.MIN);
                //如果已经赢了，则直接下棋，不再考虑对方下棋
                if (currentChessboard.isMinWin()) {
                    w = -Infinity;
                    row = step.row;
                    column = step.column;
                    //退回上一步下棋
                    currentChessboard.rollback();
                    break;
                } else {
                    //考虑对方depth-1步下棋之后的优势值，如果对方没棋可下了，则返回当前棋盘估值
                    var res = max(currentChessboard, depth - 1) || {
                        w: currentChessboard.evaluate()
                    };
                    if (res.w < w) {
                        //选择最大优势的走法
                        w = res.w;
                        row = step.row;
                        column = step.column;
                    }
                    //退回上一步下棋
                    currentChessboard.rollback();
                }
            }
            return {
                w: w,
                row: row,
                column: column
            };
        }
    }
};
Chessboard.NONE = 0;
Chessboard.MAX = 1;
Chessboard.MIN = 2;