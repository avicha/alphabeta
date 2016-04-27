/**
 * [Matrix 矩阵]
 * @param {[type]} arr [矩阵二维数组]
 */
var Matrix = function(arr) {
    this.data = arr;
    this.row = arr.length;
    this.column = arr.length ? arr[0].length : 0;
};
/**
 * [multiply 矩阵乘法转换]
 * @param  {[type]} matrix [转换矩阵]
 * @return {[type]}        [description]
 */
Matrix.prototype.multiply = function(matrix) {
    if (this.column == matrix.row) {
        var row = this.row,
            column = matrix.column,
            arr = [];
        for (var i = 0; i < row; i++) {
            arr[i] = [];
            for (var j = 0; j < column; j++) {
                var sum = 0;
                for (var n = 0; n < this.column; n++) {
                    sum += (this.data[i][n] * matrix.data[n][j]);
                }
                arr[i][j] = sum;
            }
        }
        return new Matrix(arr);
    }
};
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
 * [put 下棋]
 * @param  {[type]} row    [行]
 * @param  {[type]} column [列]
 * @param  {[type]} type   [人还是AI下棋]
 * @return {[type]}        [description]
 */
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
/**
 * [rollback 悔棋]
 * @param  {[type]} n [后退n步]
 * @return {[type]}   [description]
 */
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
/**
 * [reset 重置棋盘]
 * @return {[type]} [description]
 */
Chessboard.prototype.reset = function() {
    for (var i = 0, n = this.row; i < n; i++) {
        for (var j = 0, m = this.column; j < m; j++) {
            this.data[i][j] = Chessboard.NONE;
        }
    }
    this.stack = [];
    this.is_ended = false;
};
/**
 * [availableSteps 获取可走的位置]
 * @return {[type]} [description]
 */
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
/**
 * [rotate 把棋盘旋转90度]
 * @return {[type]} [description]
 */
Chessboard.prototype.rotate = function() {
    var board = new Chessboard(this.row, this.column),
        dx = Math.floor(this.column / 2),
        dy = Math.floor(this.row / 2);
    for (var i = 0; i < this.row; i++) {
        for (var j = 0; j < this.column; j++) {
            var type = this.data[i][j];
            var matrix = new Matrix([
                [i, j, 1]
            ]);
            var translateMatrix1 = new Matrix([
                [1, 0, 0],
                [0, 1, 0],
                [-dx, -dy, 1]
            ]);
            var translateMatrix2 = new Matrix([
                [1, 0, 0],
                [0, 1, 0],
                [dx, dy, 1]
            ]);
            var rotateMatrix = new Matrix([
                [0, -1, 0],
                [1, 0, 0],
                [0, 0, 1]
            ]);
            var res = matrix.multiply(translateMatrix1).multiply(rotateMatrix).multiply(translateMatrix2);
            board.put(res.data[0][0], res.data[0][1], type);
        }
    }
    return board;
};
/**
 * [hash 给棋盘一个编码]
 * @param  {[type]} sourceRadix [来源进制]
 * @param  {[type]} targetRadix [目的进制]
 * @return {[type]}             [description]
 */
Chessboard.prototype.hash = function(sourceRadix, targetRadix) {
    var str = this.data.map(function(arr) {
        return arr.join('');
    }).join('');
    return parseInt(str, sourceRadix).toString(targetRadix);
};
/**
 * [evaluate 计算当前棋盘的估值]
 * @return {[type]} [description]
 */
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
/**
 * [isMaxWin 人是否赢了]
 * @return {Boolean} [description]
 */
Chessboard.prototype.isMaxWin = function() {
    var w = this.evaluate();
    return w == Infinity ? true : false;
};
/**
 * [isMinWin AI是否赢了]
 * @return {Boolean} [description]
 */
Chessboard.prototype.isMinWin = function() {
    var w = this.evaluate();
    return w == -Infinity ? true : false;
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
                    alpha = Infinity;
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
                    beta = -Infinity;
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
//没有棋子
Chessboard.NONE = 0;
//玩家棋子
Chessboard.MAX = 1;
//AI棋子
Chessboard.MIN = 2;