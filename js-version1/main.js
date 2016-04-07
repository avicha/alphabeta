var chessBoard = new Board(3, 3);
var chessBoardDom = $('.chessboard');
var initData = function() {
    for (var i = 0; i < chessBoard.row; i++) {
        var rowDom = $('<div></div>').addClass('row');
        for (var j = 0; j < chessBoard.column; j++) {
            var tile = $('<div></div>').addClass('tile').data({
                row: i,
                column: j
            });
            rowDom.append(tile);
        }
        chessBoardDom.append(rowDom);
    }
};
var initEvent = function() {
    $('.tile').on('click', function() {
        var self = $(this);
        var row = self.data('row'),
            column = self.data('column');
        if (self.is('.chess')) {
            alert('请选择空余的格子下棋');
        } else {
            chessBoard.put(row, column, Board.MAX);
            self.addClass('chess chess-max').text('●');
            var w = chessBoard.evaluate();
            if (w == Infinity) {
                alert('你赢了！');
            } else {
                var res = min(chessBoard, 2);
                if (res.is_win) {
                    alert('电脑赢了！');
                }
                if (!res.is_ended) {
                    chessBoard.put(chessBoard.currentRow, chessBoard.currentColumn, Board.MIN);
                    chessBoardDom.find('.row').eq(chessBoard.currentRow).find('.tile').eq(chessBoard.currentColumn).addClass('chess chess-min').text('○');
                }
            }
        }
    });
};
initData();
initEvent();