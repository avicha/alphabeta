//棋盘
var chessboard = new Chessboard(3, 3);
var chessboardDom = $('.chessboard');
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
                self.addClass('chess chess-max').text('●');
                //人赢了，结束游戏
                if (chessboard.isMaxWin()) {
                    chessboard.end();
                    return alert('你赢了！');
                }
                //没赢，但平手了
                if (chessboard.isEnded()) {
                    return alert('你和AI打平手了！');
                } else {
                    //未分胜负，AI下棋
                    console.time('min');
                    var res = min(chessboard, 2);
                    console.timeEnd('min');
                    //AI下棋
                    chessboard.put(res.row, res.column, Chessboard.MIN);
                    chessboardDom.find('.row').eq(res.row).find('.tile').eq(res.column).addClass('chess chess-min').text('○');
                    //AI赢了，结束游戏
                    if (chessboard.isMinWin()) {
                        chessboard.end();
                        return alert('电脑赢了！');
                    }
                    //没赢，但平手了，否则未分胜负，等待人继续下棋
                    if (chessboard.isEnded()) {
                        return alert('你和AI打平手了！');
                    }
                }
            }
        }
    });
};
initData();
initEvent();