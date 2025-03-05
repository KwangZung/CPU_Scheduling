function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const output = document.getElementById('output');

    if (fileInput.files.length === 0) {
        output.innerHTML = "Vui lòng chọn một file CSV.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        //Nội dung trong file CSV
        const text = event.target.result;

        output.innerHTML = `Nội dung file CSV: <br><pre>${text}</pre>`;

        //Thực thi kết quả, in ra trên HTML
        result.innerHTML=execute(text, document.getElementById("algorithmSelect").value);
    };

    reader.readAsText(file);
    console.log("Lấy dữ liệu thành công");
}

// function getProcesses(text) {
//     const rows = text.split("\n").map(row => row.split(","));
//     return rows;
// }

// trả về kết quả thực thi
function execute(text, typeOfScheduling) {
    //lấy ra các process từ text
    const rows = text.split("\n");
    let processes = rows.slice(1).map(row => {
        const values = row.split(",");
        console.log(values[0] + values[1] + values[2] + values[3] + values[4] + "\n");
        return new Process(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3]), parseFloat(values[4]));
    });

    //Biểu đồ Gantt
    let gantt = [];
    if (typeOfScheduling == "fcfs") {
        gantt=fcfs(processes, 0);
        console.log("FCFS");
    } else if (typeOfScheduling == "sjfNP") {
        gantt=sjfNP(processes, 0);
        console.log("SJF NP");
    } else if (typeOfScheduling == "priorityNP") {
        gantt=priorityNP(processes, 0);
    } else if (typeOfScheduling == "multilevel_queue") {
        gantt = multilevelScheduling(processes);
        console.log("Multilevel");
    }
    else {
        console.log("Algorithm has't been defined. Sorry");
        const algoND = document.getElementById("algoNotDefined");
        algoND.innerHTML = "Algorithm has't been defined. Sorry";
    }
    console.log(processes);
    drawGanttChart(gantt);
    return ("Thời gian hoàn thành TB: " + getAvgCompletionTime(processes) + "\nThời gian chờ TB: " + getAvgWaitingTime(processes)
        + "\nThời gian phản hồi TB: " + getAvgRespondTime(processes) + "\nBiểu đồ Gantt: " + gantt).replace(/\n/g, "<br>");
}

function drawGanttChart(data) {
    const container = document.getElementById("gantt");
    const timeline = document.getElementById("timeline");
    container.innerHTML = "";
    timeline.innerHTML = "";

    const totalTime = data[data.length - 1].end; // Tổng thời gian chạy
    data.forEach(session => {
        const duration = session.end - session.start;
        const widthPercent = (duration / totalTime) * 100;

        // Xác định class dựa trên process ID
        let processClass = session.process.id === 0 ? "idle" : `p${session.process.id}`;

        // Tạo ô tiến trình
        const taskDiv = document.createElement("div");
        taskDiv.className = `task ${processClass}`;
        taskDiv.style.width = `${widthPercent}%`;
        taskDiv.textContent = session.process.id === 0 ? "IDLE" : `P${session.process.id}`;
        container.appendChild(taskDiv);

        // Thêm mốc thời gian dưới mỗi tiến trình
        const timeMarker = document.createElement("div");
        timeMarker.textContent = session.start;
        timeMarker.style.left = `${(session.start / totalTime) * 100}%`;
        timeline.appendChild(timeMarker);
    });

    // Thêm mốc thời gian cuối cùng
    const endTimeMarker = document.createElement("div");
    endTimeMarker.textContent = totalTime;
    endTimeMarker.style.left = "100%";
    timeline.appendChild(endTimeMarker);
}


// --------------------------------------------------------------

class Process {
    constructor(id, arrivalTime, burstTime, priorityId, readyQueueId) {
        this.id = id;
        this.arrivalTime = arrivalTime; //Thời gian đến
        this.burstTime = burstTime; //Thời gian chạy
        this.priorityId = priorityId; //Số hiệu ưu tiên
        this.readyQueueId = readyQueueId; /*Vào hàng đợi thứ mấy
        Quy định: 1 chữ số sau dấu thập phân quy định thuật toán của RQ trong trường hợp sử dụng Multilevel:
            - 1: fcfs
            - 2: sjf NP
            - 3: sjf P
            - 4: lập lịch ưu tiên NP
            - 5: lập lịch ưu tiên P
        */

        this.completionTime = 0; //Thời gian hoàn thành
        this.waitingTime = 0; //Thời gian chờ
        this.responseTime = 0; //Thời gian phản hồi
        this.quitCpuTime = 0; //Thời điểm ra khỏi CPU lần cuối
        this.firstEnterCpuTime = 0; //Thời điểm vào CPU lần đầu
    }
}

class GanttSession {
    constructor(process, start, end) {
        this.process = process;
        this.start = parseFloat(start);
        this.end = parseFloat(end);
    }

    toString() {
        return (" " + this.process.id + "[" + this.start + " - " + this.end + "]");
    }

    compareTo(other) {
        return this.start - other.start;
    }
}

// cpuStartTime: thời gian cpu bắt đầu chạy thuật toán này
function fcfs(processes, cpuStartTime){
    let ganttChart = [];
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    if (cpuStartTime == 0) {
        for (let process of processes) {
            // Tính thời gian phản hồi (là thời gian bắt đầu chạy - arrivalTime)
            if(ganttChart.length != 0) {
                let currentTime = Math.max(ganttChart[ganttChart.length - 1].end, process.arrivalTime);
                process.responseTime = currentTime - process.arrivalTime;
                ganttChart.push(new GanttSession(process, currentTime, currentTime + process.burstTime));
            }
            else {
                process.responseTime = process.arrivalTime;
                ganttChart.push(new GanttSession(process, process.arrivalTime, process.arrivalTime+process.burstTime));
            }

            // Tính thời gian hoàn thành (Completion Time)
            process.completionTime = process.responseTime + process.burstTime;

            // Tính thời gian chờ (Waiting Time)
            process.waitingTime = process.responseTime; // Vì FCFS không có preemption
        }
    } else {
        for (let process of processes) {
            // Tính thời gian phản hồi (là thời gian bắt đầu chạy - arrivalTime)
            if (ganttChart.length != 0) {
                let currentTime = ganttChart[ganttChart.length - 1].end;
                process.responseTime = currentTime - process.arrivalTime;
                ganttChart.push(new GanttSession(process, currentTime, currentTime + process.burstTime));
            }
            else {
                process.responseTime = cpuStartTime - process.arrivalTime;
                ganttChart.push(new GanttSession(process, cpuStartTime, cpuStartTime+process.burstTime));
            }

            // Tính thời gian hoàn thành (Completion Time)
            process.completionTime = process.responseTime + process.burstTime;

            // Tính thời gian chờ (Waiting Time)
            process.waitingTime = process.responseTime; // Vì FCFS không có preemption
        }
    }

    for (let i=0; i<ganttChart.length-1; i++) {
        if (ganttChart[i].end < ganttChart[i+1].start) ganttChart.push(new GanttSession(new Process(0, 0, 0, 0, 0, 0), ganttChart[i].end, ganttChart[i+1].start));
    }
    ganttChart.sort((a, b) => a.compareTo(b));
    return ganttChart;
}

function sjfNP(processes, cpuStartTime) {
    let ganttChart = [];
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.burstTime - b.burstTime);

    let current = cpuStartTime; //thời điểm hiện tại
    let completed = 0;//số process đã hoàn thành
    let readyQueue=[];
    let visitedProcesses = new Set();

    while(completed < processes.length) {
        for(let process of processes) {
            if (process.arrivalTime <= current && !visitedProcesses.has(process)) {
                readyQueue.push(process);
                visitedProcesses.add(process);
            }
        }

        if(readyQueue.length > 0) {
            readyQueue.sort((a, b) => a.burstTime - b.burstTime);
            let thisProcess = readyQueue.shift();
            let start = current;
            let end = start + thisProcess.burstTime;

            ganttChart.push(new GanttSession(thisProcess, start, end));

            thisProcess.completionTime = end - thisProcess.arrivalTime;
            thisProcess.waitingTime = start - thisProcess.arrivalTime;
            thisProcess.responseTime = start - thisProcess.arrivalTime;

            current = end;
            completed++;
        } else {
            current++; //Nếu hàng đợi trống, tiến đến tương lai thêm 1 giây
        }
    }
    for (let i=0; i<ganttChart.length-1; i++) {
        if (ganttChart[i].end < ganttChart[i+1].start) ganttChart.push(new GanttSession(new Process(0, 0, 0, 0, 0, 0), ganttChart[i].end, ganttChart[i+1].start));
    }
    ganttChart.sort((a, b) => a.compareTo(b));
    return ganttChart;
}

function priorityNP(processes, cpuStartTime) {
    let ganttChart = [];
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.burstTime - b.burstTime);

    let current = cpuStartTime; //thời điểm hiện tại
    let completed = 0;//số process đã hoàn thành
    let readyQueue=[];
    let visitedProcesses = new Set();

    while(completed < processes.length) {
        for(let process of processes) {
            if (process.arrivalTime <= current && !visitedProcesses.has(process)) {
                readyQueue.push(process);
                visitedProcesses.add(process);
            }
        }

        if(readyQueue.length > 0) {
            readyQueue.sort((a, b) => a.priorityId - b.priorityId); // sắp xếp theo chiều tăng dần
            let thisProcess = readyQueue.shift();
            let start = current;
            let end = start + thisProcess.burstTime;

            ganttChart.push(new GanttSession(thisProcess, start, end));

            thisProcess.completionTime = end - thisProcess.arrivalTime;
            thisProcess.waitingTime = start - thisProcess.arrivalTime;
            thisProcess.responseTime = start - thisProcess.arrivalTime;

            current = end;
            completed++;
        } else {
            current++; //Nếu hàng đợi trống, tiến đến tương lai thêm 1 giây
        }
    }
    for (let i=0; i<ganttChart.length-1; i++) {
        if (ganttChart[i].end < ganttChart[i+1].start) ganttChart.push(new GanttSession(new Process(0, 0, 0, 0, 0, 0), ganttChart[i].end, ganttChart[i+1].start));
    }
    ganttChart.sort((a, b) => a.compareTo(b));
    return ganttChart;
}

function multilevelScheduling(processes) {
    let ganttChart = [];

    let mlProcesses = [...processes];
    mlProcesses.sort((a, b) => a.readyQueueId - b.readyQueueId); // sort theo chiều tăng dần của RQ id

    let uniqueReadyQueueIds = new Set(mlProcesses.map(p => p.readyQueueId));
    let numberOfRQ = uniqueReadyQueueIds.size; //số lượng ready queue

    let lastReadyQueueCompletionTime = 0; //lưu thời gian hoàn thành của RQ trước đó

    for (let i = 0; i < numberOfRQ; i++) { //xử lý từng RQ
        let thisRQProcesses = [];
        let thisRQid = mlProcesses[0].readyQueueId;
        while (mlProcesses.length > 0) {
            let process = mlProcesses[0];
            if (process.readyQueueId == thisRQid) {
                thisRQProcesses.push(process);
            } else {
                break;
            }
            mlProcesses.shift();
        }
        let thisRqAlgorithm = thisRQid * 10 % 10; //lấy số thập phân trong RQ để biết thuật toán sử dụng
        console.log("thisRqAlgo is " + thisRqAlgorithm);

        let thisRqGanttChart = [];
        if (thisRqAlgorithm == 1) thisRqGanttChart=fcfs(thisRQProcesses, lastReadyQueueCompletionTime);
        else if (thisRqAlgorithm == 2) thisRqGanttChart=sjfNP(thisRQProcesses, lastReadyQueueCompletionTime);
        else if (thisRqAlgorithm == 4) thisRqGanttChart=priorityNP(thisRQProcesses, lastReadyQueueCompletionTime);
        else {
            console.log("Algorithm has't been defined. Sorry");
            const algoND = document.getElementById("algoNotDefined");
            algoND.innerHTML = "Algorithm has't been defined. Sorry";
        }
        ganttChart = ganttChart.concat(thisRqGanttChart);
        console.log("last session is " + ganttChart[ganttChart.length - 1]);
        lastReadyQueueCompletionTime = ganttChart[ganttChart.length - 1].end;
        console.log(lastReadyQueueCompletionTime);
    }
    for (let i=0; i<ganttChart.length-1; i++) {
        if (ganttChart[i].end < ganttChart[i+1].start) ganttChart.push(new GanttSession(new Process(0, 0, 0, 0, 0, 0), ganttChart[i].end, ganttChart[i+1].start));
    }
    ganttChart.sort((a, b) => a.compareTo(b));
    return ganttChart;
}

function getAvgCompletionTime(processes) {
    let sum = 0;
    let count = 0;
    for (let process of processes) {
        sum+=process.completionTime;
        count++;
    }
    return sum/count;
}

function getAvgWaitingTime(processes) {
    let sum = 0;
    let count = 0;
    for (let process of processes) {
        sum += process.waitingTime;
        count++;
    }
    return sum/count;
}

function getAvgRespondTime(processes) {
    let sum = 0;
    let count = 0;
    for (let process of processes) {
        sum += process.responseTime;
        count ++;
    }
    return sum/count;
}