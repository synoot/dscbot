import command from "../../command";
import index from "../../index"
import { TypeObject } from "../../types";

const dataHelper = index.getTDHelper()

const xMark = ":x:"
const oMark = ":o:"
const clear = "<:clear:813494718754324520>"

const va = ":regional_indicator_a:"
const vb = ":regional_indicator_b:"
const vc = ":regional_indicator_c:"

const v1 = ":one:"
const v2 = ":two:"
const v3 = ":three:"

function emojifyBoard(board : number[][]) {
    let hstring = `${clear}${va}${vb}${vc}\n`

    for (let x = 0; x < board.length; x++) {
        let etr = board[x]

        hstring = `${hstring}${x === 0 ? v1 : x === 1 ? v2 : v3}`

        for (let y = 0; y < etr.length; y++) {
            let num = etr[y]

            switch(num) {
                case 0:
                    hstring = `${hstring}${clear}`
                    break
                case 1:
                    hstring = `${hstring}${xMark}`
                    break
                case 2:
                    hstring = `${hstring}${oMark}`
                    break
            }
        }
        hstring = `${hstring}\n`
    }

    return hstring
}

function coordToXY(coord : string) {
    const str = coord.split("") // 0 - letter | 1 - number

    return [ //xy coordinates
        str[0].toLowerCase() === "a" ? 0 : str[0].toLowerCase() === "b" ? 1 : 2 ,
        Number(str[1]) - 1 
    ]
}

module.exports = {
    command: new command.Command({
        name: "ttt",
        description: "Tic-Tac-Toe",
        async callback(msg) {
            const guildcat = dataHelper.getCategory(<string>msg.guild?.id)

            const bdata = < TypeObject<any> | undefined >guildcat.getData(`${msg.author.id}_ttt`)
            const spl = msg.content.split(" ")

            if (bdata) {
                const board = bdata[0]
                const opp = bdata[1]
                const t = bdata[2]
                const n = bdata[3]

                const ni = n === 2 ? 1 : n === 1 ? 2 : 1 // if n = 2, ni = 1, otherwise n = 1, ni = 2

                if (t === msg.author.id) {
                    //check if the move is valid

                    if (spl[1] === undefined) {
                        return {
                            isReply: true,
                            message: `here's the board:\n${emojifyBoard(board)}`
                        }
                    } else if (spl[1].toLowerCase() === "quit") {
                        guildcat.removeData(`${msg.author.id}_ttt`)
                        guildcat.removeData(`${opp}_ttt`)

                        return {
                            isReply: true,
                            message: "you have quit the game."
                        }
                    }

                    if (spl[1] === undefined || spl[1].length !== 2 || isNaN(Number(spl[1].split("")[1]))) {
                        return {
                            isReply: true,
                            message: `you must give coordinates, such as <letter><number> (ex: A2)`
                        }
                    }

                    let [x, y] = coordToXY(spl[1])

                    if (board[y][x] === 0) {
                        board[y][x] = n
                        let won = false
                        let stale = true

                        for (let i = 0; i < board.length; i++) {
                            if (board[y][i] !== n) {
                                break
                            } else if (i === board.length - 1) {
                                won = true
                            }
                        }

                        for (let i = 0; i < board.length; i++) {
                            if (board[i][x] !== n) {
                                break
                            } else if (i === board.length - 1) {
                                won = true
                            }
                        }

                        if (x === y) {
                            for (let i = 0; i < board.length; i++) {
                                if (board[i][i] !== n) {
                                    break
                                } else if (i === board.length - 1) {
                                    won = true
                                }
                            }
                        }
                        
                        if (x + y === board.length - 1) {
                            for(let i = 0; i < board.length; i++){
                                if (board[(board.length - 1) - i][i] !== n) {
                                    break
                                 }if (i == board.length - 1) {
                                    won = true
                                }
                            }
                        }

                        //check for stalemate

                        for (let i = 0; i < board.length; i++) {
                            const a = board[i]

                            for (let j = 0; j < board.length; j++) {
                                if (a[j] === 0) {
                                    stale = false
                                }
                            }
                        }

                        guildcat.addData(`${msg.author.id}_ttt`, [board, opp, opp, n])
                        guildcat.addData(`${opp}_ttt`, [board, msg.author.id, opp, ni])

                        console.log(n === 1 ? 2 : n === 2 ? 1 : 2, ni) // ???
                        
                        if (won) {
                            guildcat.removeData(`${msg.author.id}_ttt`)
                            guildcat.removeData(`${opp}_ttt`)

                            return {
                                isReply: true,
                                message: `you won!\n${emojifyBoard(board)}`
                            }
                        } else if (stale) {
                            guildcat.removeData(`${msg.author.id}_ttt`)
                            guildcat.removeData(`${opp}_ttt`)

                            return {
                                isReply: false,
                                message: `;, ; you have reached a stalemate.\n${emojifyBoard(board)}`,
                                users: [ msg.author.id, opp ]
                            }
                        }

                        return {
                            isReply: false,
                            message: `Your turn, ;.\n${emojifyBoard(board)}`,
                            users: [ opp ]
                        }
                    } else {
                        return {
                            isReply: true,
                            message: "that spot is taken. Please try another."
                        }
                    }
                } else {
                    return {
                        isReply: true,
                        message: `it's not your turn! Wait for ; to make their move.`,
                        users: [ t ]
                    }
                }
            } else {
                const opp = msg.mentions.users.first()

                if (!opp) {
                    return {
                        isReply: true,
                        message: "you must ping someone to play."
                    }
                }

                const board = [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ]

                guildcat.addData(`${msg.author.id}_ttt`, [board, opp.id, msg.author.id, 1])
                guildcat.addData(`${opp.id}_ttt`, [board, msg.author.id, msg.author.id, 2])

                return {
                    isReply: false,
                    message: "Make your move:\n" + emojifyBoard(board)
                }
            }
        }
    })
}