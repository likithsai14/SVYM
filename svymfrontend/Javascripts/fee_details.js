document.addEventListener('DOMContentLoaded', () => {
    const totalFeesElement = document.getElementById('totalFees');
    const pendingFeesElement = document.getElementById('pendingFees');
    const completedFeesElement = document.getElementById('completedFees');
    const paymentHistoryTableBody = document.getElementById('paymentHistoryTableBody');
    const downloadReceiptsBtn = document.getElementById('downloadReceiptsBtn');

    // Dummy fee data for demonstration
    // In a real application, this would come from a backend API,
    // filtered by the logged-in user.
    const feeRecords = [
        {
            id: 'FEE001',
            courseName: 'Fashion Designing',
            totalAmount: 15000,
            payments: [
                { date: '2025-06-10', amount: 5000, method: 'Bank Transfer', status: 'Completed', receiptId: 'REC001' },
                { date: '2025-07-10', amount: 5000, method: 'Cash', status: 'Completed', receiptId: 'REC002' }
            ]
        },
        {
            id: 'FEE002',
            courseName: 'Mobile Repair and Service',
            totalAmount: 10000,
            payments: [
                { date: '2025-07-01', amount: 4000, method: 'Online Payment', status: 'Completed', receiptId: 'REC003' }
            ]
        },
        {
            id: 'FEE003',
            courseName: 'Electrician Assistant & Home Appliances Repair',
            totalAmount: 12000,
            payments: [] // No payments yet, so it's fully pending
        },
        {
            id: 'FEE004',
            courseName: 'Art & Craft',
            totalAmount: 8000,
            payments: [
                { date: '2025-06-20', amount: 8000, method: 'Cash', status: 'Completed', receiptId: 'REC004' }
            ]
        }
    ];

    function calculateFeeSummary() {
        let totalCourseFees = 0;
        let totalPaid = 0;

        feeRecords.forEach(course => {
            totalCourseFees += course.totalAmount;
            course.payments.forEach(payment => {
                if (payment.status === 'Completed') {
                    totalPaid += payment.amount;
                }
            });
        });

        const totalPending = totalCourseFees - totalPaid;

        totalFeesElement.textContent = `INR ${totalCourseFees.toFixed(2)}`;
        pendingFeesElement.textContent = `INR ${totalPending.toFixed(2)}`;
        completedFeesElement.textContent = `INR ${totalPaid.toFixed(2)}`;
    }

    function displayPaymentHistory() {
        paymentHistoryTableBody.innerHTML = ''; // Clear existing rows
        let hasRecords = false;

        feeRecords.forEach(course => {
            course.payments.forEach(payment => {
                hasRecords = true;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.date}</td>
                    <td>${course.courseName}</td>
                    <td>${payment.receiptId || 'N/A'}</td>
                    <td>INR ${payment.amount.toFixed(2)}</td>
                    <td>${payment.method}</td>
                    <td>${payment.status}</td>
                    <td>
                        <button class="download-receipt-single-btn" data-receipt-id="${payment.receiptId}" data-course-name="${course.courseName}" data-amount="${payment.amount.toFixed(2)}" data-date="${payment.date}" data-method="${payment.method}">
                            <i class="fas fa-file-download"></i>
                        </button>
                    </td>
                `;
                paymentHistoryTableBody.appendChild(row);
            });
        });

        if (!hasRecords) {
            paymentHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #555;">
                        No payment history available.
                    </td>
                </tr>
            `;
        }

        // Add event listeners to individual download buttons
        document.querySelectorAll('.download-receipt-single-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const data = event.currentTarget.dataset;
                generateSingleReceiptPdf(data);
            });
        });
    }

    // Function to generate a single receipt PDF
    function generateSingleReceiptPdf(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const studentName = "Student Name"; // Placeholder, fetch actual student name if available
        const date = data.date;
        const receiptId = data.receiptId;
        const courseName = data.courseName;
        const amount = data.amount;
        const method = data.method;

        doc.setFontSize(22);
        doc.setTextColor(30, 144, 255); // Dodgerblue
        doc.text("Tech4Hope", 105, 20, null, null, "center");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0); // Black
        doc.text("Payment Receipt", 105, 30, null, null, "center");

        doc.setLineWidth(0.5);
        doc.setDrawColor(30, 144, 255);
        doc.line(20, 35, 190, 35); // Horizontal line

        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50); // Dark grey

        let y = 50;
        doc.text(`Student Name: ${studentName}`, 20, y);
        y += 10;
        doc.text(`Receipt ID: ${receiptId}`, 20, y);
        y += 10;
        doc.text(`Date: ${date}`, 20, y);
        y += 10;
        doc.text(`Course: ${courseName}`, 20, y);
        y += 10;
        doc.text(`Payment Method: ${method}`, 20, y);
        y += 20;

        doc.setFontSize(18);
        doc.setTextColor(40, 167, 69); // Green
        doc.text(`Amount Paid: INR ${amount}`, 20, y);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for your payment!", 105, doc.internal.pageSize.height - 20, null, null, "center");
        doc.text("Tech4Hope, Empowering Lives Through Skills", 105, doc.internal.pageSize.height - 15, null, null, "center");

        doc.save(`Tech4Hope_Receipt_${receiptId}.pdf`);
    }

    // Function to generate a comprehensive PDF of all payment history
    downloadReceiptsBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for paper size

        doc.setFontSize(22);
        doc.setTextColor(30, 144, 255); // Dodgerblue
        doc.text("Tech4Hope - Payment Summary", 105, 20, null, null, "center");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 105, 28, null, null, "center");

        doc.setLineWidth(0.5);
        doc.setDrawColor(30, 144, 255);
        doc.line(20, 35, 190, 35);

        // Add Fee Summary
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Overall Fee Summary:", 20, 45);

        doc.setFontSize(12);
        const totalFees = totalFeesElement.textContent;
        const pendingFees = pendingFeesElement.textContent;
        const completedFees = completedFeesElement.textContent;

        doc.text(`Total Course Fees: ${totalFees}`, 20, 55);
        doc.text(`Completed Payments: ${completedFees}`, 20, 65);
        doc.text(`Pending Fees: ${pendingFees}`, 20, 75);

        // Add Payment History Table
        doc.setFontSize(14);
        doc.text("Detailed Payment History:", 20, 90);

        const tableColumn = ["Date", "Course Name", "Payment ID", "Amount Paid", "Payment Method", "Status"];
        const tableRows = [];

        feeRecords.forEach(course => {
            course.payments.forEach(payment => {
                tableRows.push([
                    payment.date,
                    course.courseName,
                    payment.receiptId || 'N/A',
                    `INR ${payment.amount.toFixed(2)}`,
                    payment.method,
                    payment.status
                ]);
            });
        });

        // AutoTable plugin for jsPDF
        doc.autoTable(tableColumn, tableRows, {
            startY: 95, // Start table below summary
            headStyles: { fillColor: [0, 123, 255] }, // Blue header
            alternateRowStyles: { fillColor: [240, 248, 255] }, // AliceBlue
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3
            },
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 25 }, // Date
                1: { cellWidth: 50 }, // Course Name
                2: { cellWidth: 30 }, // Payment ID
                3: { cellWidth: 30, halign: 'right' }, // Amount Paid
                4: { cellWidth: 30 }, // Payment Method
                5: { cellWidth: 25 }  // Status
            }
        });

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        const finalY = doc.autoTable.previous.finalY + 10;
        doc.text("This is an automatically generated document. For official receipts, please contact Tech4Hope administration.", 105, finalY + 10, null, null, "center");
        doc.text("Tech4Hope, Empowering Lives Through Skills", 105, doc.internal.pageSize.height - 15, null, null, "center");


        doc.save('Tech4Hope_Fee_Details.pdf');
    });

    // Initial load of data
    calculateFeeSummary();
    displayPaymentHistory();
});