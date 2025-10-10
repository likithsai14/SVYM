document.addEventListener("DOMContentLoaded", () => {
    // -------------------------- DOM ELEMENTS --------------------------
    const feeTableBody = document.getElementById("feeTableBody");
    const feeTableHead = document.querySelector("#feeTable thead");
    const viewTypeSelect = document.getElementById("viewType");
    const totalAmountBox = document.getElementById("totalAmountBox");
    const totalPaidBox = document.getElementById("totalPaidBox");
    const totalDuesBox = document.getElementById("totalDuesBox");
    const filterInput = document.getElementById("filterInput");

    const transactionsModal = document.getElementById("viewTransactionsModal");
    const transactionsTableBody = document.getElementById("transactionsTableBody");
    const studentFeeModal = document.getElementById("studentFeeModal");
    const totalFeesElement = document.getElementById("totalFees");
    const completedFeesElement = document.getElementById("completedFees");
    const pendingFeesElement = document.getElementById("pendingFees");
    const paymentHistoryTableBody = document.getElementById("paymentHistoryTableBody");

    const API_BASE = "/.netlify/functions";

    // -------------------------- GLOBAL VARIABLES --------------------------
    let allStudentFees = [];
    let allCourseFees = [];
    let allTransactions = [];
    let currentViewType = viewTypeSelect.value;

    // Pagination
    let currentPage = 1;
    const rowsPerPage = 8;

    // -------------------------- MODAL CLOSE --------------------------
    transactionsModal.querySelector(".close-btn").addEventListener("click", () => transactionsModal.classList.add("hide"));
    studentFeeModal.querySelector(".close-btn").addEventListener("click", () => studentFeeModal.classList.add("hide"));

    // -------------------------- FETCH ALL DATA ON LOAD --------------------------
    async function fetchAllData() {
        const overlay = document.getElementById("spinnerOverlay");
        try {
            overlay.classList.remove("hide"); // show overlay
            const [studentRes, courseRes, transactionRes] = await Promise.all([
                fetch(`${API_BASE}/getAllStudentFees`),
                fetch(`${API_BASE}/getAllCourseTransactions`),
                fetch(`${API_BASE}/getAllTransactions`)
            ]);

            allStudentFees = await studentRes.json();
            allCourseFees = await courseRes.json();
            allTransactions = await transactionRes.json();

            populateTable(currentViewType);
            setupPaginationControls();
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally{
            overlay.classList.add("hide");
        }
    }

    // -------------------------- TABLE POPULATION --------------------------
    function populateTable(viewType, filterText = "") {
        feeTableBody.innerHTML = "";
        feeTableHead.innerHTML = "";
        let data = [];
        let headers = [];

        if(viewType === "student") {
            data = allStudentFees.filter(item =>
                item.studentId.toLowerCase().includes(filterText) ||
                (item.studentName && item.studentName.toLowerCase().includes(filterText))
            );
            headers = ["Student ID","Name","No. of Enrollments","Total Amount","Total Paid","Total Dues","Actions"];
        } else if(viewType === "course") {
            data = allCourseFees.filter(item =>
                item.courseId.toLowerCase().includes(filterText) ||
                (item.courseName && item.courseName.toLowerCase().includes(filterText)) ||
                (item.trainerName && item.trainerName.toLowerCase().includes(filterText))
            );
            headers = ["Course ID","Course Name","Trainer Name","No. of Enrollments","Total Amount","Total Paid","Total Dues","Actions"];
        } else {
            data = allTransactions.transactions.filter(item =>
                item.transactionId.toLowerCase().includes(filterText) ||
                item.studentId.toLowerCase().includes(filterText) ||
                (item.studentName && item.studentName.toLowerCase().includes(filterText)) ||
                (item.courseName && item.courseName.toLowerCase().includes(filterText))
            );
            headers = ["Transaction ID","Student ID","Student Name","Course","Amount","Payment Medium","Paid To","Transaction Date"];
        }

        feeTableHead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;

        // Pagination
        const start = (currentPage - 1) * rowsPerPage;
        const paginatedData = data.slice(start, start + rowsPerPage);

        let totalAmount = 0, totalPaid = 0, totalDues = 0;

        // Helper function (outside the loop)
        function createCell(content) {
            const td = document.createElement("td");
            td.textContent = content;
            return td;
        }

        paginatedData.forEach(item => {
            const row = document.createElement("tr");
            if(viewType === "student") {
                row.append(
                    createCell(item.studentId),
                    createCell(item.studentName || "-"),
                    createCell(item.enrollmentsCount),
                    createCell(item.totalAmount),
                    createCell(item.totalPaid),
                    createCell(item.totalDues)
                );
                const actionCell = createCell("");
                const viewBtn = document.createElement("button");
                viewBtn.classList.add("action-btn","view-btn");
                viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
                viewBtn.addEventListener("click", () => openStudentFeeModal(item));
                actionCell.appendChild(viewBtn);
                row.appendChild(actionCell);

                totalAmount += item.totalAmount;
                totalPaid += item.totalPaid;
                totalDues += item.totalDues;

            } else if(viewType === "course") {
                row.append(
                    createCell(item.courseId),
                    createCell(item.courseName),
                    createCell(item.trainerName || "-"),
                    createCell(item.enrollmentsCount),
                    createCell(item.totalAmount),
                    createCell(item.totalPaid),
                    createCell(item.totalDues)
                );
                const actionCell = createCell("");
                const viewBtn = document.createElement("button");
                viewBtn.classList.add("action-btn","view-btn");
                viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
                viewBtn.addEventListener("click", () => openTransactionModal(item));
                actionCell.appendChild(viewBtn);
                row.appendChild(actionCell);

                totalAmount += item.totalAmount;
                totalPaid += item.totalPaid;
                totalDues += item.totalDues;

            } else {
                row.append(
                    createCell(item.transactionId),
                    createCell(item.studentId),
                    createCell(item.studentName || "-"),
                    createCell(item.courseName || "-"),
                    createCell(item.amount),
                    createCell(item.paymentMedium),
                    createCell(item.paidTo),
                    createCell(new Date(item.transactionDate).toLocaleString())
                );
            }

            feeTableBody.appendChild(row);
        });

        if(viewType !== "transaction") {
            totalAmountBox.textContent = `Total: ${totalAmount}`;
            totalPaidBox.textContent = `Paid: ${totalPaid}`;
            totalDuesBox.textContent = `Dues: ${totalDues}`;
        }

        updatePaginationControls(data.length);
    }


    // -------------------------- MODALS --------------------------
    function openTransactionModal(item) {
    console.log(item);
    transactionsTableBody.innerHTML = "";

    // ---------------- COURSE INFO ----------------
        const courseInfoBox = document.getElementById("courseInfoBox");
        courseInfoBox.innerHTML = `
        <div class="course-card">
            <div class="course-header">
            <h3><i class="fas fa-book"></i> ${item.courseName}</h3>
            <span class="course-id">#${item.courseId}</span>
            </div>
            <div class="course-grid">
            <div class="info-item">
                <i class="fas fa-user-tie"></i>
                <div>
                <p class="label">Trainer</p>
                <p class="value">${item.trainerName || "-"}</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-tag"></i>
                <div>
                <p class="label">Price / Enrollment</p>
                <p class="value">₹${item.price}</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-users"></i>
                <div>
                <p class="label">Enrollments</p>
                <p class="value">${item.enrollmentsCount}</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-wallet"></i>
                <div>
                <p class="label">Total Amount</p>
                <p class="value">₹${item.totalAmount}</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-money-bill-wave"></i>
                <div>
                <p class="label">Total Paid</p>
                <p class="value paid">₹${item.totalPaid}</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-exclamation-circle"></i>
                <div>
                <p class="label">Total Dues</p>
                <p class="value dues">₹${item.totalDues}</p>
                </div>
            </div>
            </div>
        </div>
        `;



    // ---------------- GROUP TRANSACTIONS BY STUDENT ----------------
    const studentMap = {};

    item.transactions.forEach(tx => {
        if (!studentMap[tx.studentId]) {
            studentMap[tx.studentId] = {
                studentName: tx.studentName,
                transactions: [],
                totalPaid: 0
            };
        }
        studentMap[tx.studentId].transactions.push(tx);
        studentMap[tx.studentId].totalPaid += tx.amount;
    });

    // ---------------- POPULATE TABLE ----------------
    Object.values(studentMap).forEach(student => {
        const txCount = student.transactions.length;

        student.transactions.forEach((tx, index) => {
            const row = document.createElement("tr");

            // Merge studentId and studentName for first row
            if (index === 0) {
                const studentIdCell = document.createElement("td");
                studentIdCell.rowSpan = txCount;
                studentIdCell.textContent = student.transactions[0].studentId;
                row.appendChild(studentIdCell);

                const studentNameCell = document.createElement("td");
                studentNameCell.rowSpan = txCount;
                studentNameCell.textContent = student.studentName || "-";
                row.appendChild(studentNameCell);
            }

            // Transaction details
            row.appendChild(createCell(tx.transactionId));
            row.appendChild(createCell(tx.amount));
            row.appendChild(createCell(tx.paymentMedium));
            row.appendChild(createCell(tx.paidTo));
            row.appendChild(createCell(new Date(tx.transactionDate).toLocaleString('en-IN')));

            // Last row of this student: add total paid and dues
            if (index === txCount - 1) {
            // ✅ Total column
            const totalPaidCell = document.createElement("td");
            totalPaidCell.innerHTML = `<strong>${student.totalPaid}</strong>`;
            row.appendChild(totalPaidCell);

            // ✅ Dues column
            const duesAmount = txCount * item.price - student.totalPaid;
            const duesCell = document.createElement("td");
            duesCell.innerHTML = `<strong>${duesAmount}</strong>`;
            row.appendChild(duesCell);
        }


            transactionsTableBody.appendChild(row);
        });
    });

    transactionsModal.classList.remove("hide");

    // ---------------- HELPER ----------------
    function createCell(content) {
        const td = document.createElement("td");
        td.textContent = content;
        return td;
    }
}


    function openStudentFeeModal(student) {
        const courses = student.courses || [];
        let total = 0, paid = 0;
        paymentHistoryTableBody.innerHTML = "";

        courses.forEach(course => {
            total += course.totalAmount || 0;
            paid += course.paid || 0;

            (course.transactions || []).forEach(payment => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${new Date(payment.transactionDate).toLocaleDateString()}</td>
                    <td>${course.courseName}</td>
                    <td>${payment.transactionId}</td>
                    <td>${payment.amount}</td>
                    <td>${payment.paymentMedium}</td>
                    <td>Completed</td>
                    <td>
                        <button class="download-receipt-btn"
                            data-transaction-id="${payment.transactionId}"
                            data-course-name="${course.courseName}"
                            data-amount="${payment.amount}"
                            data-date="${new Date(payment.transactionDate).toLocaleDateString()}"
                            data-method="${payment.paymentMedium}"
                            data-student-name="${student.studentName}">
                            <i class="fas fa-file-download"></i>
                        </button>
                    </td>
                `;
                paymentHistoryTableBody.appendChild(row);
            });
        });

        totalFeesElement.textContent = `Total : INR ${total}`;
        completedFeesElement.textContent = `Amount Paid : INR ${paid}`;
        pendingFeesElement.textContent = `Dues : INR ${total - paid}`;

        document.querySelectorAll('.download-receipt-btn').forEach(btn => {
            btn.addEventListener('click', e => generateSingleReceiptPdf(e.currentTarget.dataset));
        });

        studentFeeModal.classList.remove("hide");
    }


    function generateSingleReceiptPdf(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const studentName = data.studentName || "Student";

        doc.setFontSize(22);
        doc.setTextColor(30, 144, 255);
        doc.text("Tech4Hope", 105, 20, null, null, "center");
        doc.setFontSize(16);
        doc.setTextColor(0,0,0);
        doc.text("Payment Receipt",105,30,null,null,"center");
        doc.setLineWidth(0.5);
        doc.setDrawColor(30,144,255);
        doc.line(20,35,190,35);

        let y = 50;
        doc.setFontSize(12);
        doc.text(`Student Name: ${studentName}`,20,y);
        y+=10; doc.text(`Transaction ID: ${data.transactionId}`,20,y);
        y+=10; doc.text(`Date: ${data.date}`,20,y);
        y+=10; doc.text(`Course: ${data.courseName}`,20,y);
        y+=10; doc.text(`Payment Method: ${data.method}`,20,y);
        y+=20;

        doc.setFontSize(18);
        doc.setTextColor(40,167,69);
        doc.text(`Amount Paid: INR ${data.amount}`,20,y);
        doc.setFontSize(10);
        doc.setTextColor(150,150,150);
        doc.text("Thank you for your payment!",105,doc.internal.pageSize.height-20,null,null,"center");
        doc.text("Tech4Hope, Empowering Lives Through Skills",105,doc.internal.pageSize.height-15,null,null,"center");
        doc.save(`Tech4Hope_Receipt_${data.transactionId}.pdf`);
    }

    // -------------------------- PAGINATION --------------------------

    function setupPaginationControls() {
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            populateTable(currentViewType, filterInput.value.toLowerCase());
        }
    });

    nextBtn.addEventListener("click", () => {
        const totalItems = getCurrentData().length;
        if (currentPage < Math.ceil(totalItems / rowsPerPage)) {
            currentPage++;
            populateTable(currentViewType, filterInput.value.toLowerCase());
        }
    });
}


    function updatePaginationControls(totalItems) {
        const pageInfo = document.getElementById("pageInfo");
        pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalItems/rowsPerPage) || 1}`;
    }

    function getCurrentData() {
        const filterText = filterInput.value.toLowerCase();
        if(currentViewType === "student") return allStudentFees.filter(item => item.studentId.toLowerCase().includes(filterText) || (item.studentName && item.studentName.toLowerCase().includes(filterText)));
        if(currentViewType === "course") return allCourseFees.filter(item => item.courseId.toLowerCase().includes(filterText) || (item.courseName && item.courseName.toLowerCase().includes(filterText)) || (item.trainerName && item.trainerName.toLowerCase().includes(filterText)));
        return allTransactions.transactions.filter(item => item.transactionId.toLowerCase().includes(filterText) || item.studentId.toLowerCase().includes(filterText) || (item.studentName && item.studentName.toLowerCase().includes(filterText)) || (item.courseName && item.courseName.toLowerCase().includes(filterText)));
    }

    // -------------------------- EVENT LISTENERS --------------------------
    viewTypeSelect.addEventListener("change", () => {
        currentViewType = viewTypeSelect.value;
        filterInput.value = "";
        currentPage = 1;
        populateTable(currentViewType);
    });

    filterInput.addEventListener("input", (e) => {
        currentPage = 1;
        populateTable(currentViewType, e.target.value.toLowerCase());
    });

    // -------------------------- INIT --------------------------
    fetchAllData();
});
