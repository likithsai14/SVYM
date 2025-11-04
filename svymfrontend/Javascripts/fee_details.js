document.addEventListener('DOMContentLoaded', () => {
    const totalFeesElement = document.getElementById('totalFees');
    const pendingFeesElement = document.getElementById('pendingFees');
    const completedFeesElement = document.getElementById('completedFees');
    const paymentHistoryTableBody = document.getElementById('paymentHistoryTableBody');
    const downloadReceiptsBtn = document.getElementById('downloadReceiptsBtn');

    let feeRecords = []; // This will store all transactions for the logged-in student
    
    // --- Added studentName variable ---
    let studentName = "Student Name"; // Default fallback

    // Fetch student-specific fee data from Netlify function
    async function fetchStudentFeeData() {
        try {
            const studentId = sessionStorage.getItem('userId'); // or however you store it
            
            // --- Get student name from session storage ---
            // Assuming you store the user's name in 'userName' upon login
            studentName = sessionStorage.getItem('userName') || "Student Name"; 

            const res = await fetch("/.netlify/functions/getStudentFees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId })
            });

            if (!res.ok) throw new Error('Failed to fetch fee data');

            const data = await res.json(); // Array of student's transactions
            feeRecords = data;
            console.log(feeRecords);
            calculateFeeSummary();
            displayPaymentHistory();
        } catch (error) {
            console.error('Error fetching student fee data:', error);
            paymentHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; color:red; padding:20px;">
                        Failed to load payment data.
                    </td>
                </tr>
            `;
        }
    }


    // Calculate total, paid, and pending amounts
    function calculateFeeSummary() {
        let totalCourseFees = 0;
        let totalPaid = 0;

        feeRecords.forEach(record => {
            totalCourseFees += record.totalAmount || 0; // total price of course
            totalPaid += record.amountPaid || 0; // payment amount
        });

        const totalPending = totalCourseFees - totalPaid;

        totalFeesElement.textContent = `INR ${totalCourseFees.toFixed(2)}`;
        pendingFeesElement.textContent = `INR ${totalPending.toFixed(2)}`;
        completedFeesElement.textContent = `INR ${totalPaid.toFixed(2)}`;
    }

    // Display payment history table
    function displayPaymentHistory() {
        paymentHistoryTableBody.innerHTML = '';

        if (!feeRecords.length) {
            paymentHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:20px; color:#555;">
                        No payment history available.
                    </td>
                </tr>
            `;
            return;
        }

        let hasRecords = false;

        feeRecords.forEach(course => {
            if (course.payments && course.payments.length) {
                hasRecords = true;
                course.payments.forEach(record => {
                    const row = document.createElement('tr');
                    
                    // --- Added 'data-student-name' to the button ---
                    row.innerHTML = `
                        <td>${new Date(record.date).toLocaleDateString()}</td>
                        <td>${course.courseName || "Course Name"}</td>
                        <td>${record.transactionId}</td>
                        <td>INR ${record.amount.toFixed(2)}</td>
                        <td>${record.method}</td>
                        <td>Completed</td>
                        <td>
                            <button class="download-receipt-btn"
                                data-transaction-id="${record.transactionId}"
                                data-course-name="${course.courseName || "Course Name"}"
                                data-amount="${record.amount.toFixed(2)}"
                                data-date="${new Date(record.date).toLocaleDateString()}"
                                data-method="${record.method}"
                                data-student-name="${studentName}">
                                <i class="fas fa-file-download"></i>
                            </button>
                        </td>
                    `;
                    paymentHistoryTableBody.appendChild(row);
                });
            }
        });

        if (!hasRecords) {
            paymentHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:20px; color:#555;">
                        No payment history available.
                    </td>
                </tr>
            `;
        }

        // Attach download button event listeners
        document.querySelectorAll('.download-receipt-btn').forEach(button => {
            button.addEventListener('click', event => {
                const data = event.currentTarget.dataset;
                generateSingleReceiptPdf(data);
            });
        });
    }

    // --- ADDED HELPER FUNCTION to convert numbers to words (Indian system) ---
    function numberToWordsINR(num) {
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const inWords = (n) => {
            let str = '';
            if (n > 99) {
                str += a[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n > 19) {
                str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
            } else {
                str += a[n];
            }
            return str;
        };

        let numStr = num.toString();
        let [integerPart, decimalPart] = numStr.split('.');
        
        let words = '';
        let numInt = parseInt(integerPart);

        if (numInt === 0) {
            words = 'Zero';
        } else {
            let crores = Math.floor(numInt / 10000000);
            numInt %= 10000000;
            let lakhs = Math.floor(numInt / 100000);
            numInt %= 100000;
            let thousands = Math.floor(numInt / 1000);
            numInt %= 1000;
            let hundreds = Math.floor(numInt / 100);
            numInt %= 100;
            
            if (crores > 0) words += inWords(crores) + ' Crore ';
            if (lakhs > 0) words += inWords(lakhs) + ' Lakh ';
            if (thousands > 0) words += inWords(thousands) + ' Thousand ';
            if (hundreds > 0) words += inWords(hundreds) + ' Hundred ';
            if (numInt > 0) words += inWords(numInt);
        }

        words = words.replace(/ +/g, ' ').trim(); // Clean up extra spaces

        if (decimalPart && parseInt(decimalPart) > 0) {
            words += ' and ' + inWords(parseInt(decimalPart.slice(0, 2))) + ' Paisa';
        }
        
        // Capitalize first letter
        return words.charAt(0).toUpperCase() + words.slice(1);
    }


    // --- REPLACED 'generateSingleReceiptPdf' function ---
    function generateSingleReceiptPdf(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data from the button's dataset
        const studentName = data.studentName || "Student Name";
        const courseName = data.courseName || "N/A";
        const transactionId = data.transactionId || "N/A";
        const amount = parseFloat(data.amount).toFixed(2);
        const date = data.date || "N/A";
        const method = data.method || "N/A";
        const amountInWords = numberToWordsINR(amount) + " Only";

        // --- Document Coordinates ---
        const leftMargin = 20;
        const rightMargin = 190;
        const center = 105;
        let y = 20; // Current Y position

        // --- Helper: Draw dotted line ---
        const drawDottedLine = (x1, x2, yPos) => {
            doc.setLineDashPattern([0.5, 0.5], 0);
            doc.line(x1, yPos, x2, yPos);
            doc.setLineDashPattern([], 0); // Reset to solid
        };
        
        // --- 1. Header ---
        
        // Note: To add the logo, you must first convert 'image_9dafc5.jpg'
        // to a Base64 string and paste it here.
        // Example: const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZ...";
        // doc.addImage(logoBase64, 'JPEG', leftMargin, 15, 20, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Reg No. 122/84-5", rightMargin, y, { align: 'right' });
        y += 10;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SWAMI VIVEKANANDA YOUTH MOVEMENT", center, y, { align: 'center' });
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("CA2, KIADB Industrial Area, Hebbal, Mysore, Karnataka - 570016", center, y, { align: 'center' });
        y += 10;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Acknowledgement of Receipts", center, y, { align: 'center' });
        y += 5;
        
        doc.setLineWidth(0.5);
        doc.line(leftMargin + 10, y, rightMargin - 10, y); // Underline title
        y += 15;

        // --- 2. Body (Fill-in-the-blanks) ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        
        // Line 1: Receipt No and Date
        doc.text("No.R", leftMargin, y);
        doc.setFont("helvetica", "bold");
        // Using part of transaction ID as Receipt No for space
        const receiptNo = transactionId.length > 20 ? transactionId.substring(0, 20) + '...' : transactionId;
        doc.text(receiptNo, leftMargin + 10, y); 
        doc.setFont("helvetica", "normal");
        drawDottedLine(leftMargin + 9, 130, y + 1);

        doc.text("Date:", 140, y);
        doc.setFont("helvetica", "bold");
        doc.text(date, 152, y);
        drawDottedLine(151, rightMargin, y + 1);
        y += 12;

        // Line 2: Received From
        const receivedLabel = "Received from Mr/Ms/M/s.";
        doc.text(receivedLabel, leftMargin, y);
        doc.setFont("helvetica", "bold");
        doc.text(studentName, leftMargin + 48, y);
        drawDottedLine(leftMargin + 47, rightMargin, y + 1);
        y += 12;

        // Line 3: Sum of Rupees
        const sumLabel = "a Sum of Rupees...";
        doc.setFont("helvetica", "normal");
        doc.text(sumLabel, leftMargin, y);
        doc.setFont("helvetica", "bold");
        const amountStr = `INR ${amount}`;
        doc.text(amountStr, leftMargin + 38, y);
        drawDottedLine(leftMargin + 37, 100, y + 1);

        // Line 3 (continued): Amount in Words
        doc.setFont("helvetica", "normal");
        doc.text("Amount in Words...", 105, y);
        drawDottedLine(140, rightMargin, y + 1);
        y += 12;
        
        // Line 4: Amount in Words (continued)
        doc.setFont("helvetica", "bold");
        // Using maxWidth to auto-wrap the text if it's too long
        doc.text(amountInWords, leftMargin, y, { maxWidth: rightMargin - leftMargin - 10 }); 
        
        // Calculate Y position for the line after text wrapping
        const textLines = doc.splitTextToSize(amountInWords, rightMargin - leftMargin - 10);
        const textHeight = textLines.length * (doc.getFontSize() * 0.35); // Approx line height
        drawDottedLine(leftMargin, rightMargin, y + textHeight);
        y += textHeight + 10;
        
        // Line 5: Towards
        const towardsLabel = "towards...";
        doc.setFont("helvetica", "normal");
        doc.text(towardsLabel, leftMargin, y);
        doc.setFont("helvetica", "bold");
        doc.text(courseName, leftMargin + 20, y);
        drawDottedLine(leftMargin + 19, rightMargin, y + 1);
        y += 12;

        // Line 6: Payment Method and Date
        const methodLabel = "by Cash/Cheque/Online...";
        doc.setFont("helvetica", "normal");
        doc.text(methodLabel, leftMargin, y);
        doc.setFont("helvetica", "bold");
        // Using a cleaner value for the method
        const methodValue = `${method} (ID: ${receiptNo})`;
        doc.text(methodValue, leftMargin + 45, y, { maxWidth: 90 }); // Constrain width
        drawDottedLine(leftMargin + 44, 130, y + 1);
        
        doc.setFont("helvetica", "normal");
        doc.text("dated:", 140, y);
        doc.setFont("helvetica", "bold");
        doc.text(date, 152, y);
        drawDottedLine(151, rightMargin, y + 1);
        y += 30; // More space for signature

        // --- 3. Footer ---
        doc.setFont("helvetica", "bold");
        doc.text("Authorized Sign", rightMargin, y, { align: 'right' });
        doc.setLineWidth(0.3);
        doc.line(rightMargin - 30, y - 2, rightMargin, y - 2); // Line above signature

        // --- 4. Save ---
        doc.save(`SVYM_Receipt_${transactionId}.pdf`);
    }

    // --- Pay Dues modal and handlers ---
    function createPayModal() {
        if (document.getElementById('payModal')) return;

            const style = document.createElement('style');
            style.textContent = `
            /* Adapted from css/modal.css to style the pay modal */
            .pay-modal-backdrop {
                display: none; /* hidden until opened */
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.4);
                justify-content: center;
                align-items: center;
                padding: 20px;
            }

            /* when script sets display:flex the backdrop will become visible */
            .pay-modal-backdrop.show { display: flex; }

            .pay-modal {
                background-color: white;
                margin: auto;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                position: relative;
                animation-name: animatetop;
                animation-duration: 0.4s;
            }

            .pay-modal h3 {
                margin-top: 0;
                font-size: 1.6rem;
                color: #2e4f8f;
                border-bottom: 2px solid rgba(233,236,239,0.8);
                padding-bottom: 10px;
                margin-bottom: 20px;
            }

            .pay-modal .row { margin-bottom: 12px; }

            .pay-modal label { font-family: 'Poppins', sans-serif; display: block; margin-bottom: 6px; font-size: 16px; color: #333; }

            .pay-modal select,
            .pay-modal input { font-family: 'Poppins', sans-serif;font-size: 14px; width: 100%; padding: 10px; border: 1px solid #e9ecef; border-radius: 8px; box-sizing: border-box; }

            .pay-modal .actions { display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }

            .pay-modal .btn { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; }
            .pay-modal .btn.primary { background: var(--primary-color, #2e4f8f); color: #fff; }
            .pay-modal .btn.secondary { background: #f1f1f1; color: #333; }

            /* Animations (copied from modal.css) */
            @keyframes animatetop {
                from { top: -300px; opacity: 0; }
                to { top: 0; opacity: 1; }
            }
            `;
            document.head.appendChild(style);

        const backdrop = document.createElement('div');
        backdrop.id = 'payModal';
        backdrop.className = 'pay-modal-backdrop';

        backdrop.innerHTML = `
            <div class="pay-modal" role="dialog" aria-modal="true" aria-labelledby="payModalTitle">
                <span class="close-btn" id="payModalCloseBtn" aria-label="Close" style="position: absolute; top: 10px; right: 20px; font-size: 28px; cursor: pointer; color: #888;">&times;</span>
                <h3 id="payModalTitle">Pay Due</h3>
                    <div class="row">
                        <label for="payCourseSelect">Select Course</label>
                        <select id="payCourseSelect"><option value="">Loading...</option></select>
                    </div>
                    <div class="row">
                        <label for="payAmountInput">Amount (INR)</label>
                        <input id="payAmountInput" type="number" step="0.01" min="0" />
                    </div>
                    <div class="row">
                        <label for="payMethodSelect">Payment Method</label>
                        <select id="payMethodSelect">
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Net Banking">Net Banking</option>
                        </select>
                    </div>
                <div class="actions">
                    <button class="btn secondary" id="cancelPayBtn">Cancel</button>
                    <button class="btn primary" id="submitPayBtn">Submit Payment</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        document.getElementById('cancelPayBtn').addEventListener('click', closePayModal);
        document.getElementById('payCourseSelect').addEventListener('change', onCourseSelectChange);
        document.getElementById('submitPayBtn').addEventListener('click', onSubmitPayment);
        // close button (top-right) wired to same close handler
        const closeBtn = document.getElementById('payModalCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closePayModal);
    }

    function openPayModal() {
        createPayModal();
        populateCourseDropdown();
        const modal = document.getElementById('payModal');
        if (modal) modal.classList.add('show'); // Use class to trigger display
    }

    function closePayModal() {
        const modal = document.getElementById('payModal');
        if (modal) modal.remove();
    }

    function populateCourseDropdown() {
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        select.innerHTML = ''; // Clear loading/stale options

        if (!feeRecords || !feeRecords.length) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No enrolled courses found';
            select.appendChild(opt);
            amountInput.value = '';
            return;
        }

        feeRecords.forEach((f, idx) => {
            const opt = document.createElement('option');
            const due = (f.dueAmount != null) ? f.dueAmount : ((f.totalAmount || 0) - (f.amountPaid || 0));
            // Use courseId (provided by getStudentFees) as the option value. Fallback to id if not present.
            opt.value = f.courseId || f.id || ''; 
            opt.textContent = `${f.courseName || 'Course'} (Due: INR ${Number(due).toFixed(2)})`;
            // store index for quick lookup if needed
            opt.dataset.idx = String(idx);
            select.appendChild(opt);
        });

        select.selectedIndex = 0; // Select the first item
        onCourseSelectChange(); // Trigger change to populate amount
    }

    function onCourseSelectChange() {
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        const courseId = select.value;
        if (!courseId) {
            amountInput.value = '';
            return;
        }

        // find record by courseId or id
        const f = feeRecords.find(r => (r.courseId === courseId) || (r.id === courseId));
        if (f) {
            const due = (f.dueAmount != null) ? f.dueAmount : ((f.totalAmount || 0) - (f.amountPaid || 0));
            amountInput.value = Number(due).toFixed(2);
        } else {
             // fallback to option dataset
            const opt = select.selectedOptions[0];
            const due = opt && opt.dataset && opt.dataset.due ? Number(opt.dataset.due) : '';
            amountInput.value = due !== '' ? Number(due).toFixed(2) : '';
        }
    }

    async function onSubmitPayment(ev) {
        ev.preventDefault();
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        const methodSelect = document.getElementById('payMethodSelect');

        const courseId = select.value;
        if (!courseId) {
            alert('Please select a valid course to pay for.');
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }
        
        const studentId = sessionStorage.getItem('userId');

        const payload = {
            studentId: studentId,
            courseId: courseId, 
            amount: amount,
            paymentMethod: methodSelect.value || 'UPI'
        };
        console.log('Submitting payment payload:', payload);
        
        // Disable button to prevent double submit
        ev.target.disabled = true;
        ev.target.textContent = 'Processing...';

        try {
            const res = await fetch('/.netlify/functions/payDues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const body = await res.json();

            if (!res.ok) {
                console.error('Payment failed', body);
                alert(body.message || 'Payment failed.');
                return;
            }

            alert(body.message || 'Payment successful');
            closePayModal();
            fetchStudentFeeData(); // Refresh the data
        } catch (err) {
            console.error('Error submitting payment:', err);
            alert('An error occurred while processing the payment.');
        } finally {
            // Re-enable button
            // (Note: modal is closed, so button doesn't exist, but good practice)
            // if (ev.target) {
            //     ev.target.disabled = false;
            //     ev.target.textContent = 'Submit Payment';
            // }
        }
    }

    // Wire Pay Dues button
    if (downloadReceiptsBtn) {
        downloadReceiptsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openPayModal();
        });
    }

    // Fetch data on page load
    fetchStudentFeeData();
});