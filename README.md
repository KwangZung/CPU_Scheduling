# BÁO CÁO THUẬT TOÁN LẬP LỊCH HÀNG ĐỢI ĐA CẤP

```
Nguyễn Quang Dũng - 23021497
```
1. Quy định đầu vào
    - Định dạng file: .csv
    - Thuộc tính: id, Thời gian đến, Thời gian chạy, Số hiệu ưu tiên, Hàng đợi
       + Các dữ liệu của thuộc tính không được là số âm
       + Với id, dữ liệu phải là số nguyên dương
       + Do trong thuật toán này không sử dụng số hiệu ưu tiên, nên có
          thể để số hiệu ưu tiên bất kỳ
    - Với thuộc tính hàng đợi:
       + Định dạng: 1 số thập phân có 1 chữ số sau dấu chấm. Ví dụ: 1.1,
          2.2, ...
       + Phần nguyên: id của hàng đợi. Ở đây em quy định id bé hơn sẽ
          được thực hiện trước
       + Phần thập phân: thuật toán mà hàng đợi sử dụng, với 1 là FCFS,
          2 là SJF Non-preemptive, ... mà em đã quy định trong source
          code
2. Quy định đầu ra
    Gồm có:
   - Thời gian chờ trung bình
   - Thời gian hoàn thành trung bình
   - Thời gian phản hồi trung bình
   - Biểu đồ Gantt:
          + 2 kiểu: Chữ & Bảng
          + Với kiểu chữ: nếu CPU idle, idl à 0
4. Minh họa
    a) Đầu vào:

```
id, Thời gian đến, Thời gian chạy, Số hiệu ưu tiên, Hàng đợi
1, 0, 2, 1, 1.
2, 4, 6, 1, 2.
3, 5, 2, 1, 1.
4, 6, 4, 1, 2.
```
+ Hàng đợi 1 sẽ được thực hiện theo thuật toán 2 (SJF NP)
+ Hàng đợi 2 sẽ được thực hiện theo thuật toán 1 (FCFS)
+ Hàng đợi 1 sẽ được thực hiện trước hàng đợi 2

b) Các bước sử dụng

- Bước 1: Chọn vào tab “Thuật toán lập lịch”
  ![alt text](https://github.com/KwangZung/CPU_Scheduling/blob/main/demoImages/Screenshot%202025-03-05%20151413.jpg)
- Bước 2: Chọn loại thuật toán “Hàng đợi đa cấp”
  ![alt text](https://github.com/KwangZung/CPU_Scheduling/blob/main/demoImages/Screenshot%202025-03-05%20151507.jpg)
- Bước 3: Chọn file đầu vào đã được tạo từ trước:
![alt text](https://github.com/KwangZung/CPU_Scheduling/blob/main/demoImages/Screenshot%202025-03-05%20151542.jpg)
- Bước 4: Bấm “Thực thi” để cho ra kết quả:
![alt text](https://github.com/KwangZung/CPU_Scheduling/blob/main/demoImages/Screenshot%202025-03-05%20151615.jpg)
c) Đầu ra:
Thời gian hoàn thành TB: 6.
Thời gian chờ TB: 2.
Thời gian phản hồi TB: 2.
Biểu đồ Gantt: 1[0 - 2], 0[2 - 4], 2[4 - 10], 3[10 - 12], 4[12 - 16]


