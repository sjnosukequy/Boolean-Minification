var columns = document.getElementById('columns')
var results_columns = document.getElementById('results_columns')
var table = document.getElementById('table')
var toast = document.getElementById('toast')
var draw = document.getElementById('draw')
var minify = document.getElementById('minify')
var final = document.getElementById('final')

function Node_interface(name, data_length, type) {
    return {
        "name": name,
        "data": Array(data_length).fill(0),
        "type": type
    }
}

var columns_list = {}
var results_list = {}
var row_length
minify.addEventListener('click', () => Minify())

function reset() {
    columns_list = {}
    results_list = {}
}

function generateTable() {
    var colKey = Object.keys(columns_list)
    var resKey = ['F']
    var children = ''

    children += '<div class="flex flex-col w-1/4 md:w-1/6">'
    children += `<div class="box font-bold whitespace-nowrap">Index</div>`
    for (let i = 0; i < row_length; i++)
        children += `<div class="box">${i}</div>`
    children += '</div>'

    for (let i of colKey) {
        children += '<div class="flex flex-col w-1/4 md:w-1/6">'
        children += `<div class="box font-bold whitespace-nowrap">${i}</div>`
        for (let k in columns_list[i]["data"])
            children += `<input class="box" type="number" min="0" max="1" value="${columns_list[i]["data"][k]}" key="${i}" data_type="col" index="${k}"></input>`
        children += '</div>'
    }
    // console.log(resKey)
    // console.log(colKey)

    for (let i of resKey) {
        children += '<div class="flex flex-col w-1/4 md:w-1/6">'
        children += `<div class="box-res font-bold whitespace-nowrap">${i}</div>`
        for (let k in results_list[i]["data"])
            children += `<input class="box-res" type="number" min="0" max="1" value="${results_list[i]["data"][k]}" key="${i}" data_type="res_col" index="${k}"></input>`
        children += '</div>'
    }
    // console.log(children)
    table.innerHTML = children
    var boxes = document.getElementsByClassName('box')
    var res_boxes = document.getElementsByClassName('box-res')
    for (let i of boxes) {
        i.addEventListener('click', (element) => {
            element.target.select()
        })
        i.addEventListener('input', (element) => CheckValid(element))
    }
    for (let i of res_boxes) {
        i.addEventListener('click', (element) => {
            element.target.select()
        })
        i.addEventListener('input', (element) => CheckValid(element))
    }
}

function showToast(error, error_src) {
    toast.querySelector('h1').innerHTML = `Error at ${error_src}`
    toast.querySelector('p').innerHTML = error
    toast.classList.replace('hidden', 'flex')
    setTimeout(() => {
        toast.classList.replace('opacity-0', 'opacity-100')
    })
    setTimeout(() => {
        toast.classList.replace('opacity-100', 'opacity-0')
    }, 1000)
    setTimeout(() => {
        toast.classList.replace('flex', 'hidden')
    }, 1100)
}

draw.addEventListener('click', function () {
    reset()
    var col_text = columns.value.trim()
    // var res_col_text = results_columns.value.trim()

    try {
        var text_list = col_text.split(`,`)
        if (text_list[text_list.length - 1])
            row_length = Math.pow(2, text_list.length)
        else
            row_length = Math.pow(2, text_list.length - 1)
    } catch (error) {
        showToast(error.toString().split('at')[0], 'Columns')
    }

    try {
        var text_list = col_text.split(`,`)
        for (let i of text_list) {
            if (i)
                columns_list[`${i.trim()}`] = Node_interface(i.trim(), row_length, 'col')
        }
    } catch (error) {
        showToast(error.toString().split('at')[0], 'Columns')
    }

    results_list[`F`] = Node_interface('F', row_length, 'result', 'res_col')

    // try {
    //     var text_list = res_col_text.split(`,`)
    //     for (let i of text_list) {
    //         if (i)
    //             results_list[`${i.trim()}`] = Node_interface(i.trim(), row_length, 'result', 'res_col')
    //     }
    // } catch (error) {
    //     showToast(error.toString().split('at')[0], 'Results')
    // }

    if (Object.keys(columns_list).length == 0) {
        console.log('col')
        showToast("Please do not leave any field empty", 'Columns')
        return
    }

    // if (Object.keys(results_list).length == 0) {
    //     console.log('res_col', results_list)
    //     showToast("Please do not leave any field empty", 'Results')
    //     return
    // }

    generateTable()
})


function CheckValid(element) {
    try {
        var value = element.target.value
        if (value > 1)
            element.target.value = 1
        else if (value < 0)
            element.target.value = 0
        else if (!value)
            element.target.value = 0
        var new_value = element.target.value
        if (element.target.getAttribute('data_type') == 'col')
            columns_list[element.target.getAttribute('key')]["data"][element.target.getAttribute('index')] = parseInt(new_value)
        else if (element.target.getAttribute('data_type') == 'res_col')
            results_list[element.target.getAttribute('key')]["data"][element.target.getAttribute('index')] = parseInt(new_value)

    } catch (error) {
        element.target.value = 0
    }
}

function Minify() {
    var cols_key = Object.keys(columns_list)
    var res_key = Object.keys(results_list)

    if (cols_key.length == 0) {
        console.log('col')
        showToast("Please Draw again", 'Columns')
        return
    }

    if (res_key.length == 0) {
        console.log('res_col')
        showToast("Please Draw again", 'Results')
        return
    }

    Quine_McCluskey()

    // var tables = { ...columns_list, ...results_list }
    // console.log(tables)
}

function Quine_McCluskey() {
    var cols_key = Object.keys(columns_list)
    var res_key = Object.keys(results_list)
    var min_terms = []

    // finding minterms
    {
        var indexs = results_list[res_key[0]]["data"].map((value, index) => { if (value == 1) return index }).filter(value => value !== undefined)
        var data = []
        var ones_index = []
        for (let k of indexs) {
            var bit = ""
            var ones_index2 = []
            for (let j in cols_key) {
                bit += columns_list[cols_key[j]]["data"][k]
                if (columns_list[cols_key[j]]["data"][k] == 1)
                    ones_index2.push(j)
            }
            data.push(bit)
            ones_index.push(ones_index2)
        }
        min_terms = indexs.map((value, index) => { return { "row": value, "bit": data[index], "ones_index": ones_index[index], "included": false, "rows_connetion": [value] } })
        min_terms = min_terms.sort((a, b) => { return (a["bit"].split("1").length - 1) - (b["bit"].split("1").length - 1) })
    }

    var result_list = []
    var process_list = []
    var depth = 0

    // finding prime implicants
    {
        var element = min_terms
        var length = element.length
        for (let i = 0; i < length; i++) {
            var new_element = JSON.parse(JSON.stringify(element[i]))
            var foundMatch = false
            for (let k = i + 1; k < length; k++) {
                // console.log(element[i]["ones_index"])
                if (element[i]["ones_index"].length + 1 == element[k]["ones_index"].length) {
                    var all_match = true
                    for (let j = 0; j < element[i]["ones_index"].length; j++) {
                        if (!element[k]["ones_index"].includes(element[i]["ones_index"][j]))
                            all_match = false
                    }
                    if (all_match) {
                        var index = 0
                        for (let j = 0; j < element[k]["ones_index"].length; j++) {
                            if (!element[i]["ones_index"].includes(element[k]["ones_index"][j]))
                                index = j
                        }
                        var new_element = JSON.parse(JSON.stringify(element[i]))
                        new_element["ones_index"].push('-' + element[k]["ones_index"][index])
                        new_element["rows_connetion"].push(...element[k]["rows_connetion"])
                        process_list.push(new_element)
                        foundMatch = true
                    }
                }
            }

            // if (!foundMatch)
            //     process_list.push(new_element)
        }
    }

    depth += 1
    var all_prime_match = false
    while (!all_prime_match) {
        depth += 1
        all_prime_match = true
        var new_process_list = []
        var length = process_list.length
        for (let i = 0; i < length; i++) {
            // var new_element = JSON.parse(JSON.stringify(process_list[i]))
            var foundMatch = false
            for (let k = i + 1; k < length; k++) {
                if (process_list[i]["ones_index"].length + 1 == process_list[k]["ones_index"].length) {
                    var all_match = true
                    for (let j = 0; j < process_list[i]["ones_index"].length; j++) {
                        if (!process_list[k]["ones_index"].includes(process_list[i]["ones_index"][j]))
                            all_match = false
                    }
                    if (all_match) {
                        foundMatch = true
                        var index = 0
                        for (let j = 0; j < process_list[k]["ones_index"].length; j++) {
                            if (!process_list[i]["ones_index"].includes(process_list[k]["ones_index"][j]))
                                index = j
                        }
                        var new_element = JSON.parse(JSON.stringify(process_list[i]))
                        new_element["ones_index"].push('-' + process_list[k]["ones_index"][index])
                        new_element["rows_connetion"].push(...process_list[k]["rows_connetion"])
                        process_list[k]["included"] = true
                        new_element["included"] = false
                        var exist = false
                        for (let obj of new_process_list) {
                            var first = obj["ones_index"].sort().toString()
                            var sec = new_element["ones_index"].sort().toString()
                            if (first == sec) {
                                exist = true
                                break
                            }
                        }
                        if (!exist)
                            new_process_list.push(new_element)
                    }
                }
            }

            if (!foundMatch && !process_list[i]["included"]) {
                result_list.push(process_list[i])
            }
            else
                all_prime_match = false
        }

        process_list = new_process_list
    }

    // console.log(process_list)
    // console.log(result_list)

    // Table
    var res_length = result_list.length
    var Final_result = []
    var Temp_Choices = []
    for (let i = 0; i < res_length; i++) {
        var unique_obj = {}
        for (let k = 0; k < res_length; k++) {
            if (i == k)
                continue
            for (let p of result_list[i]["rows_connetion"]) {
                if (!unique_obj[p])
                    unique_obj[p] = 0
                if (!result_list[k]["rows_connetion"].includes(p)) {
                    unique_obj[p] = unique_obj[p] + 1
                    // console.log(i, k, p, count)
                }
            }
        }
        var unique_key = Object.keys(unique_obj)
        var check = false
        for (let key of unique_key) {
            if (unique_obj[key] == res_length - 1)
                check = true
        }
        if (!check)
            Temp_Choices.push(result_list[i])
        else
            Final_result.push(result_list[i])
    }

    console.log(Final_result)
    var final_text = "Result: </br>"
    var required_text = ""

    for (let i = 0; i < Final_result.length; i++) {
        var temp = ''
        for (let j = 0; j < cols_key.length; j++) {
            if (Final_result[i]["ones_index"].includes(j.toString()))
                temp += cols_key[j]
            else {
                if (Final_result[i]["ones_index"].includes('-' + j.toString()))
                    continue
                else
                    temp += cols_key[j] + "'"
            }
        }
        if (i == Final_result.length - 1)
            required_text += temp
        else
            required_text += temp + " or "
    }

    var temp_text = []
    for (let i = 0; i < Temp_Choices.length; i++) {
        var temp = ''
        for (let j = 0; j < cols_key.length; j++) {
            if (Temp_Choices[0]["ones_index"].includes(j.toString()))
                temp += cols_key[j]
            else {
                if (Temp_Choices[i]["ones_index"].includes('-' + j.toString()))
                    continue
                else
                    temp += cols_key[j] + "'"
            }
        }
        temp_text.push(temp)
    }
    if (temp_text.length == 0 && required_text != "")
        final_text = required_text
    else if (temp_text.length > 0) {
        for (let text_idx in temp_text) {
            var index_count = (parseInt(text_idx) + 1).toString()
            if (required_text != "")
                final_text += index_count + ") " + required_text + " or " + temp_text[text_idx] + "<br/>"
            else
                final_text += index_count + ") " + temp_text[text_idx] + "<br/>"
        }
    }
    else if (temp_text.length == 0 && required_text == "") {
        final_text += 1 + ") "
        for (let min_term in min_terms) {
            var temp = ''
            for (let j = 0; j < cols_key.length; j++) {
                if (min_terms[min_term]["ones_index"].includes(j.toString()))
                    temp += cols_key[j]
                else {
                    if (min_terms[min_term]["ones_index"].includes('-' + j.toString()))
                        continue
                    else
                        temp += cols_key[j] + "'"
                }
            }
            if (min_term == min_terms.length - 1)
                final_text += temp
            else
                final_text += temp + " or "
        }
    }
    // console.log(final_text)
    final.innerHTML = final_text
    // console.log(Temp_Choices)
}

var testcase
fetch('testcase.json')
    .then(response => response.json())
    .then(data => {
        testcase = data
    })

function quicktest() {
    columns.value = "A, B, C, D"
    results_columns.value = "F"
    row_length = 16
    for (let i of Object.keys(testcase)) {
        if (testcase[i]["type"] == "col") {
            columns_list[i] = testcase[i]
        }
        else if (testcase[i]["type"] == "result") {
            results_list[i] = testcase[i]
        }
    }

    generateTable()
}