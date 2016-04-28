//棋盘
var chessboard = new Chessboard(15, 15);
var chessboardDom = $('.chessboard');
//耗时和时钟
var t = 0,
    tick;
//初始化棋盘dom
var initData = function() {
    for (var i = 0; i < chessboard.row; i++) {
        var rowDom = $('<div></div>').addClass('row');
        for (var j = 0; j < chessboard.column; j++) {
            var tile = $('<div></div>').addClass('tile').data({
                row: i,
                column: j
            });
            rowDom.append(tile);
        }
        chessboardDom.append(rowDom);
    }
};
var initEvent = function() {
    $('.tile').on('click', function() {
        //如果下棋还未完结
        if (!chessboard.isEnded()) {
            var self = $(this);
            //已经有棋子
            if (self.is('.chess')) {
                alert('请选择空余的格子下棋');
            } else {
                var row = self.data('row'),
                    column = self.data('column');
                //人下棋
                chessboard.put(row, column, Chessboard.MAX);
                self.addClass('chess chess-max current').text('●');
                //第一次下棋开始计时
                if (!tick) {
                    tick = setInterval(function() {
                        t++;
                        $('.timer').text('你和alpha逼已经撕逼' + t + 's');
                    }, 1000);
                }
                //人赢了，结束游戏
                if (chessboard.isMaxWin()) {
                    chessboard.end();
                    clearInterval(tick);
                    return alert('你花了' + t + 's撕赢了alpha逼');
                }
                //没赢，但平手了
                if (chessboard.isEnded()) {
                    clearInterval(tick);
                    return alert('你花了' + t + 's和alpha逼撕成平手');
                } else {
                    //未分胜负，AI下棋
                    console.time('min');
                    var res = min(chessboard, 2);
                    console.timeEnd('min');
                    //AI下棋
                    chessboard.put(res.row, res.column, Chessboard.MIN);
                    $('.current').removeClass('current');
                    chessboardDom.find('.row').eq(res.row).find('.tile').eq(res.column).addClass('chess chess-min current').text('○');
                    //AI赢了，结束游戏
                    if (chessboard.isMinWin()) {
                        chessboard.end();
                        clearInterval(tick);
                        return alert('愚蠢的人类，你被alpha逼打败了！');
                    }
                    //没赢，但平手了，否则未分胜负，等待人继续下棋
                    if (chessboard.isEnded()) {
                        clearInterval(tick);
                        return alert('你花了' + t + 's撕赢了alpha逼');
                    }
                }
            }
        }
    });
    //悔棋
    $('.rollback').on('click', function() {
        //倒退两步
        var steps = chessboard.rollback(2);
        //清空前两步的dom文本
        steps.forEach(function(step) {
            chessboardDom.find('.row').eq(step.row).find('.tile').eq(step.column).removeClass('chess chess-min chess-max current').text('');
        });
        //返回当前的下棋位置，并添加current类
        var step = chessboard.current();
        if (step) {
            chessboardDom.find('.row').eq(step.row).find('.tile').eq(step.column).addClass('current');
        }
    });
};
initData();
initEvent();