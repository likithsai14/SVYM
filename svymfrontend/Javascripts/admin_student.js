document.addEventListener('DOMContentLoaded', async function () {
    // ------------------------------
    // Element References
    // ------------------------------
    const studentForm = document.getElementById('studentForm');
    const messageDiv = document.getElementById('message');
    const approvalMessageDiv = document.getElementById('adminapprovalMessage');
    const generatedUserIdDiv = document.getElementById('generatedUserId');
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const districtSelect = document.getElementById('districtName');
    const talukSelect = document.getElementById('talukName');
    const casteSelect = document.getElementById('caste');
    const referralSource = document.getElementById('referralSource');
    const staffNameDiv = document.getElementById('staffNameDiv');
    const staffNameInput = document.getElementById('staffName');
    const mobiliserSelect = document.getElementById('mobiliserName'); // dropdown
    const mobiliserNameText = document.getElementById('mobiliserNameText');

    const addStudentsBtn = document.getElementById('addStudentsBtn');
    const viewRequestsBtn = document.getElementById('viewRequestsBtn');
    const requestsBadge = document.getElementById('requestsCount'); // badge for pending requests

    const studentTableBody = document.getElementById('studentTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const viewModal = document.getElementById('viewModal');
    const viewModalBody = document.getElementById('studentDetailsTable');

    const requestsModal = document.getElementById('requestsModal');
    const requestsTableBody = document.getElementById('requestsTable').querySelector('tbody');

    const studentFormModal = document.getElementById('studentFormModal');

    mobiliserSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        mobiliserNameText.value = selectedOption ? selectedOption.text : '';
    });

    referralSource.addEventListener('change', function() {
        if (this.value === 'SVYM Staff') {
            staffNameDiv.style.display = 'flex';
            staffNameInput.setAttribute('required', 'required');
        } else {
            staffNameDiv.style.display = 'none';
            staffNameInput.removeAttribute('required');
            staffNameInput.value = '';
        }
        clearError(referralSource);
    });

    // ------------------------------
    // Error handling spans
    // ------------------------------
    const errorSpans = {};
    studentForm.querySelectorAll('input, select').forEach(input => {
        const spanId = input.id + 'Error';
        errorSpans[input.id] = document.getElementById(spanId);
    });

    function showError(input, message) {
        const span = errorSpans[input.id];
        if (span) {
            span.textContent = message;
            input.classList.add('input-error');
        }
    }

    function clearError(input) {
        const span = errorSpans[input.id];
        if (span) {
            span.textContent = '';
            input.classList.remove('input-error');
        }
    }

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 4000);
    }

    function showApprovalMessage(type, text) {
        approvalMessageDiv.textContent = text;
        approvalMessageDiv.className = '';
        approvalMessageDiv.classList.add('message', type);
        approvalMessageDiv.style.display = 'block';
        setTimeout(() => { approvalMessageDiv.style.display = 'none'; }, 4000);
    }

    // ------------------------------
    // Districts & Taluks
    // ------------------------------
    const districts = [
        "Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban",
        "Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga",
        "Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan",
        "Haveri","Kalaburagi (Gulbarga)","Kodagu","Kolar","Koppal",
        "Mandya","Mysuru","Raichur","Ramanagara","Shivamogga (Shimoga)",
        "Tumakuru","Udupi","Uttara Kannada (Karwar)","Vijayapura (Bijapur)","Yadgir"
    ].sort();

    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    const districtTaluks = {
        "Bagalkot": ["Badami","Bagalkot","Bilgi","Hungund","Jamkhandi","Mudhol","Rabkavi Banhatti"],
        "Ballari":["Ballari","Hospet (Vijayanagara)","Kudligi","Sandur","Siruguppa","Kampli","Hagaribommanahalli","Kotturu","Kurugodu","Hoovina Hadagali"],
        "Belagavi":["Athani","Bailhongal","Belagavi","Chikodi","Gokak","Hukkeri","Khanapur","Raibag","Ramdurg","Saundatti","Kagwad","Mudalagi","Nippani"],
        "Bengaluru Rural":["Devanahalli","Doddaballapur","Hosakote","Nelamangala","Vijayapura"],
        "Bengaluru Urban":["Bengaluru North","Bengaluru South","Bengaluru East","Anekal","Yelahanka","Kengeri"],
        "Bidar":["Aurad","Basavakalyan","Bhalki","Bidar","Humnabad","Kamalanagar","Chitguppa"],
        "Chamarajanagar":["Chamarajanagar","Gundlupet","Kollegal","Yelandur","Hanur"],
        "Chikkaballapur":["Bagepalli","Chikkaballapur","Gauribidanur","Gudibanda","Sidlaghatta","Chintamani"],
        "Chikkamagaluru":["Chikkamagaluru","Kadur","Koppa","Mudigere","Narasimharajapura","Sringeri","Tarikere"],
        "Chitradurga":["Chitradurga","Challakere","Hiriyur","Holalkere","Hosadurga","Molakalmuru"],
        "Dakshina Kannada":["Bantwal","Belthangady","Mangaluru","Puttur","Sullia","Kadaba","Mulki","Moodabidri"],
        "Davanagere":["Channagiri","Davanagere","Harihar","Honnali","Jagalur","Nyamathi"],
        "Dharwad":["Annigeri","Dharwad","Hubballi","Kalghatgi","Kundgol","Navalgund","Alnavar"],
        "Gadag":["Gadag","Gajendragad","Laxmeshwar","Mundargi","Nargund","Ron","Shirhatti"],
        "Hassan":["Alur","Arkalgud","Arsikere","Belur","Channarayapattana","Hassan","Holenarasipur","Sakleshpur"],
        "Haveri":["Byadgi","Hanagal","Haveri","Hirekerur","Ranebennur","Savnur","Shiggaon"],
        "Kalaburagi (Gulbarga)":["Afzalpur","Aland","Chincholi","Chittapur","Kalaburagi","Jevargi","Sedam","Kamalapur","Shahabad","Yadrami"],
        "Kodagu":["Madikeri","Somvarpet","Virajpet"],
        "Kolar":["Bangarapet","Kolar","Malur","Mulbagal","Srinivaspur"],
        "Koppal":["Gangavati","Koppal","Kushtagi","Yelburga","Kanakagiri","Karatagi"],
        "Mandya":["Krishnarajapet","Maddur","Malavalli","Mandya","Nagamangala","Pandavapura","Srirangapatna","Maddur"],
        "Mysuru":["Mysuru","Hunsur","Nanjangud","T. Narasipur","Krishnarajanagara","Piriyapatna","Saragur"],
        "Raichur":["Devadurga","Lingsugur","Manvi","Raichur","Sindhanur","Maski","Sirwar"],
        "Ramanagara":["Channapattana","Kanakapura","Magadi","Ramanagara"],
        "Shivamogga (Shimoga)":["Bhadravati","Hosanagara","Sagar","Shikaripur","Shivamogga","Sorab","Thirthahalli"],
        "Tumakuru":["Chiknayakanahalli","Gubbi","Koratagere","Kunigal","Madhugiri","Pavagada","Sira","Tiptur","Tumakuru","Turuvekere"],
        "Udupi":["Brahmavar","Byndoor","Karkala","Kaup","Kundapura","Udupi","Hebri"],
        "Uttara Kannada (Karwar)":["Ankola","Bhatkal","Haliyal","Honnavar","Joida","Karwar","Kumta","Mundgod","Siddapur","Sirsi","Yellapur"],
        "Vijayapura (Bijapur)":["Basavana Bagewadi","Bijapur (Vijayapura)","Indi","Muddebihal","Sindagi","Kolhar","Tikota"],
        "Yadgir":["Gurumitkal","Shahapur","Shorapur","Vadagera","Yadgir","Gurumitkal"]
    };

    districtSelect.addEventListener('change', function () {
        const selectedDistrict = this.value;
        talukSelect.innerHTML = '<option value="">Select Taluk</option>';
        talukSelect.disabled = true;
        if (selectedDistrict && districtTaluks[selectedDistrict]) {
            const taluks = districtTaluks[selectedDistrict].sort();
            taluks.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.textContent = t;
                talukSelect.appendChild(option);
            });
            talukSelect.disabled = false;
        }
        clearError(districtSelect);
        clearError(talukSelect);
    });

    casteSelect.addEventListener('change', function () {
        clearError(casteSelect);
    });

    // ------------------------------
    // DOB → Age
    // ------------------------------
    dobInput.addEventListener('change', function () {
        const dob = new Date(this.value);
        if (isNaN(dob)) { ageInput.value = ''; showError(dobInput, 'Invalid date'); return; }
        clearError(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        ageInput.value = age;
        if (age < 18 || age > 45) showError(ageInput,'Age must be 18-45'); else clearError(ageInput);
    });

    // ------------------------------
    // Fetch & Render Students
    // ------------------------------
    let studentsData = [];
    let currentPage = 1;
    const rowsPerPage = 7;

    async function fetchStudents() {
        try {
            const res = await fetch('/.netlify/functions/allstudents');
            const data = await res.json();
            studentsData = data.students.map(st => ({
                id: st._id.$oid || st._id,
                userId: st.userId,
                candidateName: st.candidateName,
                fatherHusbandName: st.fatherHusbandName,
                familyMembers: st.familyMembers,
                referralSource: st.referralSource,
                staffName: st.staffName,
                email: st.email,
                mobile: st.candidatePhone,
                parentPhone: st.parentPhone,
                aadharNumber: st.aadharNumber,
                gender: st.gender,
                caste: st.caste,
                dob: st.dob,
                age:  st.age,
                education: st.qualification,
                districtName: st.districtName,
                talukName: st.talukName,
                villageName: st.villageName,
                fieldMobiliserId: st.fieldMobiliserId,
                fieldMobiliserName: st.fieldMobiliserName,
                supportedProject: st.supportedProject,
                referralSource: st.referralSource,
                staffName: st.staffName,
                tribal: st.tribal,
                pwd: st.pwd,
                status: st.approvalStatus || "Active",
                creationDate: new Date(st.createdAt).toLocaleDateString('en-IN')
            }));
            renderStudentsTable();
        } catch (err) {
            console.error("Error fetching students:", err);
            showMessage("error", "Failed to load student data.");
        }
    }

    async function loadFieldMobilisers(){
        try{
            const response = await fetch('/.netlify/functions/getFieldMobileData');
            const result = await response.json();

            if(response.ok && Array.isArray(result.fieldMobilisers)){
                mobiliserSelect.innerHTML = '<option value="">Select Mobiliser</option>';
                result.fieldMobilisers.forEach(m=>{
                    const option=document.createElement('option');
                    option.value = m.userId;
                    option.textContent = m.FieldMobiliserName;
                    mobiliserSelect.appendChild(option);
                });
            } else {
                mobiliserSelect.innerHTML = '<option value="">No mobilisers available</option>';
                console.error('Failed to load mobilisers:', result);
            }
        } catch(error){
            console.error('Error fetching mobilisers:',error);
            mobiliserSelect.innerHTML = '<option value="">Error loading mobilisers</option>';
        }
    }

    function renderStudentsTable() {
        studentTableBody.innerHTML = "";
        const searchValue = searchInput.value.toLowerCase();
        const filtered = studentsData.filter(student =>
            student.candidateName.toLowerCase().includes(searchValue)
        );

        const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedStudents = filtered.slice(start, end);

        if (paginatedStudents.length === 0) {
            studentTableBody.innerHTML = '<tr><td colspan="7">No students found.</td></tr>';
            updatePaginationInfo();
            return;
        }

        paginatedStudents.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.userId}</td>
                <td>${student.candidateName}</td>
                <td>${student.email || '-'}</td>
                <td><span class="status ${student.status}">${student.status}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${student.userId}"><i class="fas fa-eye"></i> View</button>
                    <button class="action-btn edit-btn" data-id="${student.userId}"><i class="fas fa-pen"></i> Edit</button>
                </td>
            `;
            studentTableBody.appendChild(tr);
        });

        document.querySelectorAll('.view-btn').forEach(btn =>
            btn.addEventListener('click', () => openViewStudentModal(btn.dataset.id))
        );
        document.querySelectorAll('.edit-btn').forEach(btn =>
            btn.addEventListener('click', () => openAddEditStudentModal(btn.dataset.id))
        );

        updatePaginationInfo();
    }

    function updatePaginationInfo() {
        const total = Math.ceil(studentsData.length / rowsPerPage) || 1;
        document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${total}`;
    }

    // ------------------------------
    // Add / Edit Student Modal
    // ------------------------------
    addStudentsBtn.addEventListener('click', () => {
        studentForm.reset();
        generatedUserIdDiv.textContent = '';
        studentFormModal.style.display = 'flex';
    });

    loadFieldMobilisers();

    async function openAddEditStudentModal(id) {
        const student = studentsData.find(s => s.userId === id);
        if (!student) return;
        studentFormModal.style.display = 'flex';
        document.getElementById('candidateName').value = student.candidateName;
        document.getElementById('fatherHusbandName').value = student.fatherHusbandName;
        document.getElementById('email').value = student.email;
        document.getElementById('candidatePhone').value = student.mobile;
        document.getElementById('gender').value = student.gender;
        document.getElementById('dob').value = student.dob;
        document.getElementById('age').value = student.age;
        document.getElementById('qualification').value = student.education;
        document.getElementById('villageName').value = student.villageName;
        document.getElementById('districtName').value = student.districtName;
        districtSelect.dispatchEvent(new Event('change'));
        document.getElementById('talukName').value = student.talukName;
        document.getElementById('caste').value = student.caste;
        document.getElementById('aadharNumber').value = student.aadharNumber;
        document.getElementById('tribal').value = student.tribal;
        document.getElementById('pwd').value = student.pwd;
        document.getElementById('mobiliserName').value = student.fieldMobiliserId;
        document.getElementById('parentPhone').value = student.parentPhone;
        document.getElementById('familyMembers').value = student.familyMembers;
        document.getElementById('supportedProject').value = student.supportedProject;
        document.getElementById('referralSource').value = student.referralSource;
        document.getElementById('referralSource').dispatchEvent(new Event('change'));
        document.getElementById('staffName').value = student.staffName;

        generatedUserIdDiv.textContent = student.userId;
    }

    studentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(studentForm);
        const studentObj = Object.fromEntries(formData.entries());

        if (!/^\d{10}$/.test(studentObj.candidatePhone)) {
            showError(document.getElementById('candidatePhone'), 'Mobile must be exactly 10 digits');
            return;
        }
        console.log(studentObj);
        try {

            const res = await fetch('/.netlify/functions/addOrUpdateStudent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentObj)
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', data.message || 'Student saved successfully');
                setTimeout(() => {
                    studentFormModal.style.display = 'none';
                    fetchStudents();
                }, 1000);
            }else {
                showMessage('error', data.message || 'Failed to save student');
            }
        } catch (err) {
            console.error(err);
            showMessage('error', 'Error saving student');
        }
    });

    // ------------------------------
    // View Student Modal (Updated Tabular Format)
    // ------------------------------
    function openViewStudentModal(id) {
        const student = studentsData.find(s => s.userId === id);
        if (!student) return;

        const table = viewModalBody;
        table.innerHTML = '';

        const groups = [
            { title: 'Basic Details', fields: [
                ['User ID', student.userId],
                ['Name', student.candidateName],
                ['Status', student.status],
                ['Date of Birth', student.dob],
                ['Age', student.age],
                ['Gender', student.gender]
            ]},
            { title: 'Address Details', fields: [
                ['District', student.districtName],
                ['Taluk', student.talukName],
                ['Village', student.villageName]
            ]},
            { title: 'Contact Details', fields: [
                ['Email', student.email],
                ['Mobile', student.mobile],
                ['Aadhar Number', student.aadharNumber],
                ['Field Mobiliser', student.fieldMobiliserName]
            ]},
            { title: 'Other Details', fields: [
                ['Caste', student.caste],
                ['Tribal', student.tribal],
                ['Pwd', student.pwd],
                ['Education', student.education],
                ['Creation Date', student.creationDate]
            ]}
        ];

        groups.forEach(group => {
            const trTitle = document.createElement('tr');
            const tdTitle = document.createElement('td');
            tdTitle.colSpan = 4;
            tdTitle.className = 'group-title';
            tdTitle.textContent = group.title;
            trTitle.appendChild(tdTitle);
            table.appendChild(trTitle);

            for (let i = 0; i < group.fields.length; i += 2) {
                const tr = document.createElement('tr');

                const [label1, value1] = group.fields[i];
                const td1 = document.createElement('td');
                td1.innerHTML = `<strong>${label1}</strong>`;
                const td2 = document.createElement('td');
                td2.textContent = value1 || 'N/A';
                tr.appendChild(td1);
                tr.appendChild(td2);

                if (i + 1 < group.fields.length) {
                    const [label2, value2] = group.fields[i+1];
                    const td3 = document.createElement('td');
                    td3.innerHTML = `<strong>${label2}</strong>`;
                    const td4 = document.createElement('td');
                    td4.textContent = value2 || 'N/A';
                    tr.appendChild(td3);
                    tr.appendChild(td4);
                } else {
                    const td3 = document.createElement('td'); td3.colSpan = 2; td3.textContent = '';
                    tr.appendChild(td3);
                }

                table.appendChild(tr);
            }
        });

        viewModal.style.display = 'flex';
    }

    // ------------------------------
    // Search
    // ------------------------------
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        renderStudentsTable();
    });

    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') { currentPage = 1; renderStudentsTable(); }
    });

    // ------------------------------
    // Pagination Controls
    // ------------------------------
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderStudentsTable(); }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(studentsData.length / rowsPerPage) || 1;
        if (currentPage < totalPages) { currentPage++; renderStudentsTable(); }
    });

    // ------------------------------
    // Requests Modal
    // ------------------------------
    async function fetchRequests() {
        try {
            const res = await fetch('/.netlify/functions/studentallrequest');
            const data = await res.json();
            const requests = data.students || [];
            requestsBadge.textContent = requests.length;
            requestsTableBody.innerHTML = '';

            requests.forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${req.userId}</td>
                    <td>${req.candidateName}</td>
                    <td>${req.email}</td>
                    <td>${new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                        <button class="approve-btn" data-id="${req.userId}">Approve</button>
                        <button class="reject-btn" data-id="${req.userId}">Reject</button>
                    </td>
                `;
                requestsTableBody.appendChild(tr);
            });

            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', () => updateRequest(btn.dataset.id, 'approved'));
            });
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', () => updateRequest(btn.dataset.id, 'rejected'));
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function updateRequest(id, status) {
        try {
            const res = await fetch('/.netlify/functions/studentrequesthandler', {
                method: 'POST',
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                showApprovalMessage('success', `Request ${status}`);
                await fetchRequests();
            } else {
                showApprovalMessage('error', 'Failed to update request');
            }
        } catch (err) {
            console.error(err);
            showApprovalMessage('error', 'Error updating request');
        }
    }

    viewRequestsBtn.addEventListener('click', () => {
        requestsModal.style.display = 'flex';
    });

    // ------------------------------
    // Close Modals
    // ------------------------------
    document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
        location.reload(); // reload after modal closes
    });
});


    // ------------------------------
    // Initialize
    // ------------------------------
    fetchStudents();
    fetchRequests();
});
