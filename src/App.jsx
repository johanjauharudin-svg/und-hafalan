import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs
} from 'firebase/firestore';

// Konfigurasi database yang sudah diperbarui dengan milikmu
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyCLVJWrayGuuH_EAjOGNk0HDtgI9W6LMbs",
      authDomain: "und-hafalan-74b85.firebaseapp.com",
      projectId: "und-hafalan-74b85",
      storageBucket: "und-hafalan-74b85.firebasestorage.app",
      messagingSenderId: "149783147076",
      appId: "1:149783147076:web:23a087da22ea5c90f0c211",
      measurementId: "G-KZXG5TY0EZ"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'und-hafalan-74b85';

// 50 Kosakata Rekap Baru yang Diberikan Pengguna
const INITIAL_VOCAB = [
  // 09 Juni 2026
  { id: 'v1', tanggal: '2026-06-09', indonesia: 'Meja', inggris: 'Table', pronunciation: 'Tey-ebl', kategori: 'Ruang Tamu' },
  { id: 'v2', tanggal: '2026-06-09', indonesia: 'Kursi', inggris: 'Chair', pronunciation: 'ce-er', kategori: 'Ruang Tamu' },
  { id: 'v3', tanggal: '2026-06-09', indonesia: 'Pintu', inggris: 'Door', pronunciation: 'dor', kategori: 'Rumah' },
  { id: 'v4', tanggal: '2026-06-09', indonesia: 'Jendela', inggris: 'Window', pronunciation: 'win-dou', kategori: 'Rumah' },
  { id: 'v5', tanggal: '2026-06-09', indonesia: 'Tempat tidur', inggris: 'Bed', pronunciation: 'bed', kategori: 'Kamar Tidur' },
  { id: 'v6', tanggal: '2026-06-09', indonesia: 'Piring', inggris: 'Plate', pronunciation: 'pleyt', kategori: 'Dapur' },
  { id: 'v7', tanggal: '2026-06-09', indonesia: 'Sendok', inggris: 'Spoon', pronunciation: 'spuun', kategori: 'Dapur' },
  { id: 'v8', tanggal: '2026-06-09', indonesia: 'Cangkir/Gelas kecil', inggris: 'Cup', pronunciation: 'kap', kategori: 'Dapur' },
  { id: 'v9', tanggal: '2026-06-09', indonesia: 'Gelas (minum)', inggris: 'Glass', pronunciation: 'Gleas', kategori: 'Dapur' },
  { id: 'v10', tanggal: '2026-06-09', indonesia: 'Botol', inggris: 'Bottle', pronunciation: 'Bo-tol', kategori: 'Dapur' },

  // 11 Juni 2026
  { id: 'v11', tanggal: '2026-06-11', indonesia: 'Tas', inggris: 'Bag', pronunciation: 'beg', kategori: 'Sekolah' },
  { id: 'v12', tanggal: '2026-06-11', indonesia: 'Garpu', inggris: 'Fork', pronunciation: 'fork', kategori: 'Dapur' },
  { id: 'v13', tanggal: '2026-06-11', indonesia: 'Pisau', inggris: 'Knife', pronunciation: 'naif', kategori: 'Dapur' },
  { id: 'v14', tanggal: '2026-06-11', indonesia: 'Topi', inggris: 'Hat', pronunciation: 'het', kategori: 'Pakaian' },
  { id: 'v15', tanggal: '2026-06-11', indonesia: 'Sepatu', inggris: 'Shoe', pronunciation: 'syuu', kategori: 'Pakaian' },
  { id: 'v16', tanggal: '2026-06-11', indonesia: 'Bantal', inggris: 'Pillow', pronunciation: 'pilo', kategori: 'Kamar Tidur' },
  { id: 'v17', tanggal: '2026-06-11', indonesia: 'Selimut', inggris: 'Blanket', pronunciation: 'blengkit', kategori: 'Kamar Tidur' },
  { id: 'v18', tanggal: '2026-06-11', indonesia: 'Handuk', inggris: 'Towel', pronunciation: 'tauwel', kategori: 'Kamar Mandi' },
  { id: 'v19', tanggal: '2026-06-11', indonesia: 'Sabun', inggris: 'Soap', pronunciation: 'soup', kategori: 'Kamar Mandi' },
  { id: 'v20', tanggal: '2026-06-11', indonesia: 'Sikat gigi', inggris: 'Toothbrush', pronunciation: 'tuthbrash', kategori: 'Kamar Mandi' },

  // 13 Juni 2026
  { id: 'v21', tanggal: '2026-06-13', indonesia: 'Pasta gigi', inggris: 'Toothpaste', pronunciation: 'tuthpeyst', kategori: 'Kamar Mandi' },
  { id: 'v22', tanggal: '2026-06-13', indonesia: 'Sisir', inggris: 'Comb', pronunciation: 'kom', kategori: 'Kamar Mandi' },
  { id: 'v23', tanggal: '2026-06-13', indonesia: 'Cermin', inggris: 'Mirror', pronunciation: 'mirer', kategori: 'Kamar Mandi' },
  { id: 'v24', tanggal: '2026-06-13', indonesia: 'Lantai', inggris: 'Floor', pronunciation: 'flor', kategori: 'Rumah' },
  { id: 'v25', tanggal: '2026-06-13', indonesia: 'Dinding', inggris: 'Wall', pronunciation: 'wol', kategori: 'Rumah' },
  { id: 'v26', tanggal: '2026-06-13', indonesia: 'Atap', inggris: 'Roof', pronunciation: 'ruf', kategori: 'Rumah' },
  { id: 'v27', tanggal: '2026-06-13', indonesia: 'Lemari', inggris: 'Cupboard', pronunciation: 'kaberd', kategori: 'Rumah' },
  { id: 'v28', tanggal: '2026-06-13', indonesia: 'Rak', inggris: 'Shelf', pronunciation: 'shelf', kategori: 'Rumah' },
  { id: 'v29', tanggal: '2026-06-13', indonesia: 'Tirai', inggris: 'Curtain', pronunciation: 'kerten', kategori: 'Rumah' },
  { id: 'v30', tanggal: '2026-06-13', indonesia: 'Pulpen', inggris: 'Pen', pronunciation: 'pen', kategori: 'Sekolah' },
  { id: 'v31', tanggal: '2026-06-13', indonesia: 'Penghapus', inggris: 'Eraser', pronunciation: 'ireyser', kategori: 'Sekolah' },
  { id: 'v32', tanggal: '2026-06-13', indonesia: 'Penggaris', inggris: 'Ruler', pronunciation: 'ruler', kategori: 'Sekolah' },
  { id: 'v33', tanggal: '2026-06-13', indonesia: 'Kaos', inggris: 'T-shirt', pronunciation: 'tisyert', kategori: 'Pakaian' },
  { id: 'v34', tanggal: '2026-06-13', indonesia: 'Celana', inggris: 'Pants', pronunciation: 'pents', kategori: 'Pakaian' },
  { id: 'v35', tanggal: '2026-06-13', indonesia: 'Rok', inggris: 'Skirt', pronunciation: 'skert', kategori: 'Pakaian' },
  { id: 'v36', tanggal: '2026-06-13', indonesia: 'Kaos kaki', inggris: 'Socks', pronunciation: 'soks', kategori: 'Pakaian' },
  { id: 'v37', tanggal: '2026-06-13', indonesia: 'Sarung tangan', inggris: 'Gloves', pronunciation: 'glavs', kategori: 'Pakaian' },
  { id: 'v38', tanggal: '2026-06-13', indonesia: 'Sepeda', inggris: 'Bicycle', pronunciation: 'baysikl', kategori: 'Transportasi' },
  { id: 'v39', tanggal: '2026-06-13', indonesia: 'Motor', inggris: 'Motorcycle', pronunciation: 'motersaykl', kategori: 'Transportasi' },
  { id: 'v40', tanggal: '2026-06-13', indonesia: 'Mobil', inggris: 'Car', pronunciation: 'kar', kategori: 'Transportasi' },

  // 15 Juni 2026
  { id: 'v41', tanggal: '2026-06-15', indonesia: 'Jalan', inggris: 'Road', pronunciation: 'roud', kategori: 'Lingkungan' },
  { id: 'v42', tanggal: '2026-06-15', indonesia: 'Rumah', inggris: 'House', pronunciation: 'haus', kategori: 'Lingkungan' },
  { id: 'v43', tanggal: '2026-06-15', indonesia: 'Pagar', inggris: 'Fence', pronunciation: 'fens', kategori: 'Lingkungan' },
  { id: 'v44', tanggal: '2026-06-15', indonesia: 'Kebun', inggris: 'Garden', pronunciation: 'gardeng', kategori: 'Lingkungan' },
  { id: 'v45', tanggal: '2026-06-15', indonesia: 'Pohon', inggris: 'Tree', pronunciation: 'tri', kategori: 'Lingkungan' },
  { id: 'v46', tanggal: '2026-06-15', indonesia: 'Bunga', inggris: 'Flower', pronunciation: 'flawer', kategori: 'Lingkungan' },
  { id: 'v47', tanggal: '2026-06-15', indonesia: 'Rumput', inggris: 'Grass', pronunciation: 'gras', kategori: 'Lingkungan' },
  { id: 'v48', tanggal: '2026-06-15', indonesia: 'Tanah', inggris: 'Ground', pronunciation: 'graund', kategori: 'Lingkungan' },
  { id: 'v49', tanggal: '2026-06-15', indonesia: 'Langit', inggris: 'Sky', pronunciation: 'skai', kategori: 'Lingkungan' },
  { id: 'v50', tanggal: '2026-06-15', indonesia: 'Awan', inggris: 'Cloud', pronunciation: 'klaud', kategori: 'Lingkungan' }
];

const INITIAL_MEMBERS = [
  { id: 'm1', nama: 'Adit' },
  { id: 'm2', nama: 'Cecep' },
  { id: 'm3', nama: 'Budi' },
  { id: 'm4', nama: 'Andi' },
  { id: 'm5', nama: 'Siti' },
  { id: 'm6', nama: 'Rina' },
];

const INITIAL_HISTORY = [
  { id: 'h1', tanggal: '2026-06-15', nama: 'Adit', benar: 8, salah: 2, nilai: 80 },
  { id: 'h2', tanggal: '2026-06-15', nama: 'Cecep', benar: 9, salah: 1, nilai: 90 },
  { id: 'h3', tanggal: '2026-06-15', nama: 'Siti', benar: 10, salah: 0, nilai: 100 },
  { id: 'h4', tanggal: '2026-06-14', nama: 'Adit', benar: 7, salah: 3, nilai: 70 },
  { id: 'h5', tanggal: '2026-06-14', nama: 'Budi', benar: 6, salah: 4, nilai: 60 },
  { id: 'h6', tanggal: '2026-06-13', nama: 'Cecep', benar: 10, salah: 0, nilai: 100 },
];

// Helper Format Tanggal untuk tombol Filter Cepat
const formatTanggalCepat = (ymd) => {
  if (!ymd) return '';
  const [year, month, day] = ymd.split('-');
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${parseInt(day)} ${bulan[parseInt(month) - 1]}`;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('peserta'); 
  const [activeTab, setActiveTab] = useState('hafalan'); 
  
  // Data State
  const [vocabList, setVocabList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Custom Alert & Confirm Box States
  const [notification, setNotification] = useState(null); 
  const [confirmDialog, setConfirmDialog] = useState(null); 

  // Admin Password Security State
  const [isAdminPasswordOpen, setIsAdminPasswordOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Vocab Modal Form
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [vocabModalTab, setVocabModalTab] = useState('single'); 
  const [bulkInputText, setBulkInputText] = useState('');
  const [editingVocab, setEditingVocab] = useState(null);
  const [vocabForm, setVocabForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    indonesia: '',
    inggris: '',
    pronunciation: '',
    kategori: ''
  });

  // Member & Attendance Date selector
  const [newMemberName, setNewMemberName] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('2026-06-15');

  // Quiz States
  const [selectedQuizMembers, setSelectedQuizMembers] = useState([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizRound, setQuizRound] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizResultsSummary, setQuizResultsSummary] = useState(null);

  // Quiz Date Filter States (New Feature Added)
  const [quizStartDate, setQuizStartDate] = useState('');
  const [quizEndDate, setQuizEndDate] = useState('');
  const [quizVocabPool, setQuizVocabPool] = useState([]);

  // Statistics Individual Selection
  const [selectedStatMember, setSelectedStatMember] = useState('');

  // --- MEMORIZATION MODE STATE ---
  const [viewMode, setViewMode] = useState('tabel_hafal');
  const [hideEnglishAll, setHideEnglishAll] = useState(true);
  const [hideIndoAll, setHideIndoAll] = useState(false);
  const [hidePronounceAll, setHidePronounceAll] = useState(true);
  
  const [revealedItems, setRevealedItems] = useState({}); 
  const [chunkLimit, setChunkLimit] = useState(999); 

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const vocabCol = collection(db, 'artifacts', appId, 'public', 'data', 'vocab');
    const memberCol = collection(db, 'artifacts', appId, 'public', 'data', 'members');
    const historyCol = collection(db, 'artifacts', appId, 'public', 'data', 'history');

    const unsubVocab = onSnapshot(vocabCol, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_VOCAB.forEach(async (v) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vocab', v.id), v);
        });
      } else {
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        setVocabList(list);
      }
    }, (error) => console.error("Firestore Vocab Error:", error));

    const unsubMembers = onSnapshot(memberCol, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_MEMBERS.forEach(async (m) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'members', m.id), m);
        });
      } else {
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => a.nama.localeCompare(b.nama));
        setMemberList(list);
      }
    }, (error) => console.error("Firestore Members Error:", error));

    const unsubHistory = onSnapshot(historyCol, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_HISTORY.forEach(async (h) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'history', h.id), h);
        });
      } else {
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        setTestHistory(list);
      }
    }, (error) => console.error("Firestore History Error:", error));

    return () => {
      unsubVocab();
      unsubMembers();
      unsubHistory();
    };
  }, [user]);

  const showAlert = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const triggerResetDatabaseToRekapNew = () => {
    setConfirmDialog({
      title: "🔄 Kosongkan & Rekap Ulang Database?",
      message: "Tindakan ini akan MENGHAPUS SEMUA kosakata lama di database cloud Anda dan menggantinya dengan 50 KOSAKATA REKAP BARU yang telah dikelompokkan dalam kategori rapi. Tindakan ini tidak dapat dibatalkan!",
      onConfirm: async () => {
        try {
          showAlert("Sedang mengosongkan cloud database...", "info");
          const vocabColRef = collection(db, 'artifacts', appId, 'public', 'data', 'vocab');
          const snapshot = await getDocs(vocabColRef);
          for (const docSnap of snapshot.docs) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vocab', docSnap.id));
          }
          for (const item of INITIAL_VOCAB) {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vocab', item.id), item);
          }
          showAlert("Sukses! Database berhasil dikosongkan & direkap ulang dengan 50 Kosakata Baru!", "success");
        } catch (err) {
          console.error("Gagal Reset Database:", err);
          showAlert("Gagal melakukan reset database.", "error");
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleSwitchToAdmin = () => {
    if (role === 'admin') {
      setRole('peserta');
      setActiveTab('hafalan');
    } else {
      setIsAdminPasswordOpen(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    if (passwordInput === 'Joe@j93') {
      setRole('admin');
      setActiveTab('dashboard');
      setIsAdminPasswordOpen(false);
      showAlert("Login Admin Berhasil! Kredensial Diverifikasi.", "success");
    } else {
      setPasswordError("Password salah! Hubungi Administrator.");
    }
  };

  const parsedBulkVocabs = useMemo(() => {
    if (!bulkInputText.trim()) return [];
    const lines = bulkInputText.split('\n');
    const results = [];
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      let splitIndex = trimmed.indexOf('=');
      if (splitIndex === -1) splitIndex = trimmed.indexOf('-');
      
      if (splitIndex !== -1) {
        const indWord = trimmed.substring(0, splitIndex).trim();
        const rest = trimmed.substring(splitIndex + 1).trim();
        
        let engWord = rest;
        let pronWord = '';
        
        const readMarkers = [/\bdi\s*baca\b/i, /\bdibaca\b/i, /\bbaca\b/i];
        for (const marker of readMarkers) {
          const match = rest.match(marker);
          if (match) {
            const markerIndex = match.index;
            engWord = rest.substring(0, markerIndex).trim();
            pronWord = rest.substring(markerIndex + match[0].length).trim();
            break;
          }
        }
        
        results.push({
          indonesia: indWord,
          inggris: engWord,
          pronunciation: pronWord,
          tanggal: vocabForm.tanggal,
          kategori: vocabForm.kategori || 'Lain-lain'
        });
      }
    });
    return results;
  }, [bulkInputText, vocabForm.tanggal, vocabForm.kategori]);

  const categories = useMemo(() => {
    const cats = vocabList.map(v => v.kategori).filter(Boolean);
    return [...new Set(cats)];
  }, [vocabList]);

  const filteredVocab = useMemo(() => {
    return vocabList.filter(vocab => {
      const matchSearch = 
        vocab.indonesia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vocab.inggris.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vocab.pronunciation && vocab.pronunciation.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchDate = filterDate ? vocab.tanggal === filterDate : true;
      const matchCat = filterCategory ? vocab.kategori === filterCategory : true;

      return matchSearch && matchDate && matchCat;
    });
  }, [vocabList, searchQuery, filterDate, filterCategory]);

  const stats = useMemo(() => {
    const totalVocab = vocabList.length;
    const totalPeserta = memberList.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const testHariIni = testHistory.filter(h => h.tanggal === todayStr).length;

    const nilaiHariIni = testHistory.filter(h => h.tanggal === todayStr).map(h => h.nilai);
    const nilaiTertinggiHariIni = nilaiHariIni.length > 0 ? Math.max(...nilaiHariIni) : 0;

    const partisipasi = {};
    testHistory.forEach(h => {
      partisipasi[h.nama] = (partisipasi[h.nama] || 0) + 1;
    });
    let teraktif = '-';
    let maxTes = 0;
    Object.entries(partisipasi).forEach(([nama, jumlah]) => {
      if (jumlah > maxTes) {
        maxTes = jumlah;
        teraktif = nama;
      }
    });

    return {
      totalVocab,
      totalPeserta,
      testHariIni,
      nilaiTertinggiHariIni,
      teraktif: maxTes > 0 ? `${teraktif} (${maxTes}x Tes)` : '-'
    };
  }, [vocabList, memberList, testHistory]);

  const familyAttendanceMatrix = useMemo(() => {
    const testsOnDate = testHistory.filter(h => h.tanggal === attendanceDate);
    return memberList.map(member => {
      const testRecord = testsOnDate.find(t => t.nama.toLowerCase() === member.nama.toLowerCase());
      return {
        nama: member.nama,
        hadir: !!testRecord,
        nilai: testRecord ? testRecord.nilai : null,
        benar: testRecord ? testRecord.benar : null,
        salah: testRecord ? testRecord.salah : null,
      };
    });
  }, [memberList, testHistory, attendanceDate]);

  const handleOpenAddVocab = () => {
    setEditingVocab(null);
    setVocabForm({
      tanggal: new Date().toISOString().split('T')[0],
      indonesia: '',
      inggris: '',
      pronunciation: '',
      kategori: ''
    });
    setVocabModalTab('single');
    setBulkInputText('');
    setIsVocabModalOpen(true);
  };

  const handleOpenEditVocab = (vocab) => {
    setEditingVocab(vocab);
    setVocabForm({
      tanggal: vocab.tanggal,
      indonesia: vocab.indonesia,
      inggris: vocab.inggris,
      pronunciation: vocab.pronunciation || '',
      kategori: vocab.kategori || ''
    });
    setVocabModalTab('single');
    setIsVocabModalOpen(true);
  };

  const handleSaveVocab = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!vocabForm.indonesia || !vocabForm.inggris) {
      showAlert("Harap isi kata Indonesia & Inggris!", "error");
      return;
    }

    try {
      const updatedForm = {
        ...vocabForm,
        kategori: vocabForm.kategori.trim() || 'Umum'
      };
      if (editingVocab) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vocab', editingVocab.id);
        await updateDoc(docRef, updatedForm);
        showAlert("Kosakata berhasil diperbarui!", "success");
      } else {
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'vocab');
        await addDoc(colRef, updatedForm);
        showAlert("Kosakata baru berhasil disimpan!", "success");
      }
      setIsVocabModalOpen(false);
    } catch (err) {
      console.error(err);
      showAlert("Gagal menyimpan kata.", "error");
    }
  };

  const handleSaveBulkVocab = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (parsedBulkVocabs.length === 0) {
      showAlert("Format salah atau teks kosong!", "error");
      return;
    }

    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'vocab');
      for (const item of parsedBulkVocabs) {
        await addDoc(colRef, item);
      }
      showAlert(`Sukses memasukkan ${parsedBulkVocabs.length} kosakata baru!`, "success");
      setIsVocabModalOpen(false);
      setBulkInputText('');
    } catch (err) {
      console.error(err);
      showAlert("Gagal menyimpan massal.", "error");
    }
  };

  const triggerDeleteVocab = (id) => {
    setConfirmDialog({
      title: "Hapus Kosakata",
      message: "Apakah Anda yakin ingin menghapus kata ini dari daftar hafalan?",
      onConfirm: async () => {
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'vocab', id);
          await deleteDoc(docRef);
          showAlert("Kosakata dihapus.", "info");
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !user) return;

    if (memberList.some(m => m.nama.toLowerCase() === newMemberName.trim().toLowerCase())) {
      showAlert("Nama peserta tersebut sudah terdaftar!", "error");
      return;
    }

    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'members');
      await addDoc(colRef, { nama: newMemberName.trim() });
      showAlert(`Peserta ${newMemberName} berhasil ditambahkan!`, "success");
      setNewMemberName('');
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDeleteMember = (id, nama) => {
    setConfirmDialog({
      title: "Hapus Anggota",
      message: `Hapus ${nama}? Riwayat skor tes yang lampau akan tetap dipertahankan.`,
      onConfirm: async () => {
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', id);
          await deleteDoc(docRef);
          showAlert(`Peserta ${nama} dihapus.`, "info");
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog(null);
      }
    });
  };

  const toggleIndividualReveal = (itemId, type) => {
    const key = `${itemId}_${type}`;
    setRevealedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetAllReveals = () => {
    setRevealedItems({});
  };

  const handleToggleSelectQuizMember = (nama) => {
    if (selectedQuizMembers.includes(nama)) {
      setSelectedQuizMembers(selectedQuizMembers.filter(m => m !== nama));
    } else {
      setSelectedQuizMembers([...selectedQuizMembers, nama]);
    }
  };

  const handleSelectAllQuizMembers = () => {
    if (selectedQuizMembers.length === memberList.length) {
      setSelectedQuizMembers([]);
    } else {
      setSelectedQuizMembers(memberList.map(m => m.nama));
    }
  };

  const startQuiz = () => {
    if (selectedQuizMembers.length === 0) {
      showAlert("Pilih minimal satu nama peserta kuis!", "error");
      return;
    }
    if (vocabList.length === 0) {
      showAlert("Belum ada kosakata di database!", "error");
      return;
    }

    // Memfilter kosakata berdasarkan rentang tanggal yang dipilih
    let pool = vocabList;
    if (quizStartDate && quizEndDate) {
      pool = vocabList.filter(v => v.tanggal >= quizStartDate && v.tanggal <= quizEndDate);
    } else if (quizStartDate) {
      pool = vocabList.filter(v => v.tanggal >= quizStartDate);
    } else if (quizEndDate) {
      pool = vocabList.filter(v => v.tanggal <= quizEndDate);
    }

    if (pool.length === 0) {
      showAlert("Tidak ada kosakata pada rentang tanggal tersebut!", "error");
      return;
    }

    setQuizVocabPool(pool); // Menyimpan kosakata yang sudah difilter untuk sesi ini

    const initialRound = selectedQuizMembers.map(nama => ({
      nama,
      benar: 0,
      salah: 0,
    }));

    setQuizRound(initialRound);
    setCurrentQuizIndex(0);
    setIsQuizActive(true);
    setQuizResultsSummary(null);
    pickRandomQuestion(pool);
  };

  const pickRandomQuestion = (poolParam) => {
    const activePool = poolParam || quizVocabPool;
    const randomIndex = Math.floor(Math.random() * activePool.length);
    setCurrentQuestion(activePool[randomIndex]);
    setShowAnswer(false);
  };

  const handleAnswer = (isCorrect) => {
    const updatedRound = [...quizRound];
    const currentParticipant = updatedRound[currentQuizIndex];

    if (isCorrect) {
      currentParticipant.benar += 1;
    } else {
      currentParticipant.salah += 1;
    }

    setQuizRound(updatedRound);

    const nextIndex = (currentQuizIndex + 1) % selectedQuizMembers.length;
    setCurrentQuizIndex(nextIndex);
    pickRandomQuestion();
  };

  const finishQuiz = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const results = quizRound.map(participant => {
      const totalSoal = participant.benar + participant.salah;
      const nilai = totalSoal > 0 ? Math.round((participant.benar / totalSoal) * 100) : 0;
      return { ...participant, nilai, tanggal: todayStr };
    });

    try {
      const historyCol = collection(db, 'artifacts', appId, 'public', 'data', 'history');
      for (const res of results) {
        await addDoc(historyCol, {
          tanggal: res.tanggal,
          nama: res.nama,
          benar: res.benar,
          salah: res.salah,
          nilai: res.nilai
        });
      }
      showAlert("Hasil ujian tersimpan permanen!", "success");
    } catch (err) {
      console.error(err);
    }

    setQuizResultsSummary(results);
    setIsQuizActive(false);
    setCurrentQuestion(null);
  };

  useEffect(() => {
    if (!selectedStatMember && memberList.length > 0) {
      setSelectedStatMember(memberList[0].nama);
    }
  }, [memberList, selectedStatMember]);

  const memberStats = useMemo(() => {
    if (!selectedStatMember) return null;

    const memberHistory = testHistory
      .filter(h => h.nama.toLowerCase() === selectedStatMember.toLowerCase())
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    const totalTes = memberHistory.length;
    const rataRataNilai = totalTes > 0 
      ? Math.round(memberHistory.reduce((sum, h) => sum + h.nilai, 0) / totalTes) 
      : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hariIniHist = memberHistory.find(h => h.tanggal === todayStr);
    const kemarinHist = memberHistory.find(h => h.tanggal === yesterdayStr);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const mingguIniHist = memberHistory.filter(h => new Date(h.tanggal) >= sevenDaysAgo);
    const rataRataMingguIni = mingguIniHist.length > 0
      ? Math.round(mingguIniHist.reduce((sum, h) => sum + h.nilai, 0) / mingguIniHist.length)
      : 0;

    return {
      history: memberHistory,
      totalTes,
      rataRataNilai,
      nilaiHariIni: hariIniHist ? hariIniHist.nilai : '-',
      nilaiKemarin: kemarinHist ? kemarinHist.nilai : '-',
      nilaiMingguIni: rataRataMingguIni || '-'
    };
  }, [testHistory, selectedStatMember]);

  const formattedToday = useMemo(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  }, []);

  // Dynamic Date untuk tombol Filter Cepat
  const todayYMD = new Date().toISOString().split('T')[0];
  const latestUploadYMD = vocabList.length > 0 ? vocabList[0].tanggal : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col pb-24 md:pb-6 lg:pb-0">
      
      {/* BRANDED HEADER */}
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-950 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3 sm:gap-2">
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-start">
            <div className="bg-white text-indigo-700 p-2 md:p-2.5 rounded-xl font-bold text-xl md:text-2xl shadow-inner flex-shrink-0">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-xl font-extrabold tracking-tight truncate">Hafalan UnD</h1>
                <span className="bg-indigo-500 text-[10px] md:text-xs text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">v2.5</span>
              </div>
              <p className="text-[10px] md:text-xs text-indigo-200 font-medium">
                Dibuat oleh <span className="text-white font-bold decoration-amber-400 underline">Johan Jauharudin</span>
              </p>
            </div>
          </div>

          {/* Toggle Role / Menu Admin Proteksi */}
          <button 
            onClick={handleSwitchToAdmin}
            className={`w-full sm:w-auto px-4 py-2.5 md:py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
              role === 'admin' 
                ? 'bg-amber-500 text-white shadow-md animate-pulseOnce' 
                : 'bg-indigo-800 text-indigo-100 hover:text-white hover:bg-indigo-700'
            }`}
          >
            {role === 'admin' ? '🔓 Menu Admin Aktif' : '🔐 Masuk Admin'}
          </button>
        </div>
      </header>

      {/* DASHBOARD UTAMA - Responsive Grid */}
      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 md:grid md:grid-cols-4 lg:grid-cols-12 md:gap-6">
        
        {/* SIDE NAVIGATION (Visible on Tablet & Desktop) */}
        <aside className="hidden md:block md:col-span-1 lg:col-span-3 mb-6 lg:mb-0">
          <nav className="bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-1.5 sticky top-24">
            {role === 'admin' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-lg">📊</span> <span className="text-sm">Dashboard</span>
              </button>
            )}

            <button 
              onClick={() => setActiveTab('hafalan')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'hafalan' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="text-lg">📖</span> <span className="text-sm">Daftar Hafalan</span>
            </button>

            {role === 'admin' && (
              <button 
                onClick={() => setActiveTab('tes')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'tes' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-lg">🎯</span> <span className="text-sm">Mulai Tes Acak</span>
              </button>
            )}

            <button 
              onClick={() => setActiveTab('statistik')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'statistik' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="text-lg">📈</span> <span className="text-sm">Statistik & Absensi</span>
            </button>

            {role === 'admin' && (
              <button 
                onClick={() => setActiveTab('anggota')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'anggota' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-lg">👥</span> <span className="text-sm">Daftar Anggota</span>
              </button>
            )}
          </nav>
          
          {/* BRANDING SIDEBAR */}
          <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100/50 text-center shadow-sm">
            <span className="text-2xl block mb-2">✨</span>
            <p className="text-sm font-bold text-slate-700">Hafalan UnD v2.5</p>
            <p className="text-[11px] text-slate-500 mt-1">Dibuat oleh</p>
            <p className="text-sm font-black text-indigo-600 mt-0.5">Johan Jauharudin</p>
          </div>
        </aside>

        {/* UTAMA PANEL TAMPILAN */}
        <section className="md:col-span-3 lg:col-span-9 flex flex-col gap-6">

          {/* ==================== TAB: DASHBOARD ADMIN ==================== */}
          {activeTab === 'dashboard' && role === 'admin' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                  <span className="text-9xl">👑</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black">Panel Kontrol Penguji 👋</h2>
                <p className="mt-2 text-indigo-100 text-xs md:text-sm leading-relaxed max-w-2xl">
                  Tanggal: <span className="font-semibold underline">{formattedToday}</span>. Dibuat oleh Johan Jauharudin untuk kenyamanan belajar adik-adik.
                </p>
              </div>

              {/* REKAP / RE-SEED DATABASE OPTION */}
              <div className="bg-amber-50 border border-amber-200 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-start md:items-center gap-3">
                  <span className="text-2xl md:text-3xl mt-1 md:mt-0">🔄</span>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-amber-800">Butuh Kosongkan & Rekap Database?</h3>
                    <p className="text-xs md:text-sm text-amber-700 mt-1">Gunakan tombol di bawah ini untuk mereset dan langsung mengisi database cloud dengan **50 kosakata rekap baru** secara instan.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={triggerResetDatabaseToRekapNew}
                    className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs md:text-sm px-5 py-3 md:py-2.5 rounded-xl transition shadow"
                  >
                    🔄 Kosongkan & Rekap Ulang Database Baru
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-2">📚</span>
                  <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">Total Kosakata</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{stats.totalVocab}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-2">👥</span>
                  <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">Total Peserta</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{stats.totalPeserta}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-2">📝</span>
                  <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">Ujian Hari Ini</p>
                  <p className="text-xl md:text-2xl font-bold text-indigo-600 mt-1">{stats.testHariIni}x</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-2">🏆</span>
                  <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">Skor Tertinggi</p>
                  <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{stats.nilaiTertinggiHariIni > 0 ? stats.nilaiTertinggiHariIni : '-'}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-between col-span-2 md:col-span-1 hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-2">⚡</span>
                  <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">Teraktif</p>
                  <p className="text-[11px] md:text-xs font-bold text-amber-600 mt-2 truncate">{stats.teraktif}</p>
                </div>
              </div>

              {/* AKSI CEPAT ADMIN */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm md:text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
                  ⚡ Tombol Pintas Penguji
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={handleOpenAddVocab}
                    className="p-4 md:p-5 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/80 rounded-xl text-left font-semibold flex items-center gap-3 md:gap-4 transition shadow-sm"
                  >
                    <span className="text-2xl md:text-3xl">➕</span>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold">Input Kosakata Baru</h4>
                      <p className="text-[10px] md:text-xs font-normal text-slate-500 mt-0.5">Mendukung tempel banyak teks</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('tes')}
                    className="p-4 md:p-5 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100/80 rounded-xl text-left font-semibold flex items-center gap-3 md:gap-4 transition shadow-sm"
                  >
                    <span className="text-2xl md:text-3xl">🎯</span>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold">Mulai Tes Acak</h4>
                      <p className="text-[10px] md:text-xs font-normal text-slate-500 mt-0.5">Uji hafalan bergiliran</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('statistik')}
                    className="p-4 md:p-5 bg-amber-50/70 text-amber-700 hover:bg-amber-100/80 rounded-xl text-left font-semibold flex items-center gap-3 md:gap-4 transition shadow-sm"
                  >
                    <span className="text-2xl md:text-3xl">📊</span>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold">Kehadiran & Absen</h4>
                      <p className="text-[10px] md:text-xs font-normal text-slate-500 mt-0.5">Cek siapa yang hadir/bolos</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: DAFTAR KOSAKATA ==================== */}
          {activeTab === 'hafalan' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Bagian Filter & Pencarian */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 md:space-y-5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-grow relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base md:text-lg">🔍</span>
                    <input 
                      type="text"
                      placeholder="Cari kosakata (Indonesia, Inggris, atau cara bacanya)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 md:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm transition-shadow"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:w-auto">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full sm:w-48 px-4 py-3 md:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm text-slate-600 font-semibold bg-white transition-shadow"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full sm:w-48 px-4 py-3 md:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm text-slate-600 bg-white transition-shadow"
                    />
                  </div>
                </div>

                {/* Filter Cepat Tanggal */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-3 border-t border-slate-100 text-xs md:text-sm">
              <span className="text-slate-400 font-medium">Filter Cepat Hari:</span>
              <button 
                onClick={() => { setFilterDate(''); setFilterCategory(''); }}
                className={`px-4 py-1.5 md:py-2 rounded-full font-bold transition-colors ${!filterDate && !filterCategory ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setFilterDate(todayYMD)}
                className={`px-4 py-1.5 md:py-2 rounded-full font-bold transition-colors ${filterDate === todayYMD ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {formatTanggalCepat(todayYMD)} (Hari Ini)
              </button>
              {latestUploadYMD && latestUploadYMD !== todayYMD && (
                <button 
                  onClick={() => setFilterDate(latestUploadYMD)}
                  className={`px-4 py-1.5 md:py-2 rounded-full font-bold transition-colors ${filterDate === latestUploadYMD ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {formatTanggalCepat(latestUploadYMD)} (Terakhir Upload)
                </button>
              )}
            </div>
          </div>

          {/* PANEL METODE HAFALAN TAHFIDZ (ACTIVE RECALL) */}
              <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 rounded-2xl p-5 md:p-6 text-white shadow-md space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl md:text-4xl">🧠</span>
                    <div>
                      <h4 className="text-sm md:text-base font-black tracking-wide uppercase">Metode Hafalan Active Recall</h4>
                      <p className="text-[10px] md:text-xs text-indigo-200 mt-0.5">Gunakan sistem Tutup-Buka kolom untuk memicu ingatan visual (Active Recall).</p>
                    </div>
                  </div>

                  {/* Switch Mode Tampilan */}
                  <div className="flex bg-indigo-900/60 p-1.5 rounded-xl text-xs md:text-sm font-bold self-start lg:self-center w-full lg:w-auto">
                    <button 
                      onClick={() => setViewMode('tabel_hafal')}
                      className={`flex-1 lg:flex-none px-4 py-2 rounded-lg transition-colors ${viewMode === 'tabel_hafal' ? 'bg-white text-indigo-950 shadow-md' : 'text-indigo-200 hover:text-white'}`}
                    >
                      🕌 Mode Tabel Hafalan
                    </button>
                    <button 
                      onClick={() => setViewMode('kartu')}
                      className={`flex-1 lg:flex-none px-4 py-2 rounded-lg transition-colors ${viewMode === 'kartu' ? 'bg-white text-indigo-950 shadow-md' : 'text-indigo-200 hover:text-white'}`}
                    >
                      🗂️ Mode Grid Kartu
                    </button>
                  </div>
                </div>

                {viewMode === 'tabel_hafal' && (
                  <div className="bg-indigo-900/40 p-4 md:p-5 rounded-xl border border-indigo-700/50 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Master control tutup buka */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs md:text-sm font-bold w-full md:w-auto">
                        <span className="text-indigo-300 self-start sm:self-center mr-1 mb-1 sm:mb-0">Tutup Kolom Masal:</span>
                        <div className="grid grid-cols-2 sm:flex gap-2">
                          <button 
                            onClick={() => { setHideIndoAll(!hideIndoAll); resetAllReveals(); }}
                            className={`px-3 py-2 rounded-lg border transition-colors shadow-sm ${hideIndoAll ? 'bg-amber-500 border-amber-400 text-white' : 'bg-indigo-900 border-indigo-700 text-indigo-200 hover:bg-indigo-800'}`}
                          >
                            {hideIndoAll ? '🔓 Buka Indonesia' : '🔒 Tutup Indonesia'}
                          </button>
                          <button 
                            onClick={() => { setHideEnglishAll(!hideEnglishAll); resetAllReveals(); }}
                            className={`px-3 py-2 rounded-lg border transition-colors shadow-sm ${hideEnglishAll ? 'bg-amber-500 border-amber-400 text-white' : 'bg-indigo-900 border-indigo-700 text-indigo-200 hover:bg-indigo-800'}`}
                          >
                            {hideEnglishAll ? '🔓 Buka Inggris' : '🔒 Tutup Inggris'}
                          </button>
                          <button 
                            onClick={() => { setHidePronounceAll(!hidePronounceAll); resetAllReveals(); }}
                            className={`col-span-2 sm:col-span-1 px-3 py-2 rounded-lg border transition-colors shadow-sm ${hidePronounceAll ? 'bg-amber-500 border-amber-400 text-white' : 'bg-indigo-900 border-indigo-700 text-indigo-200 hover:bg-indigo-800'}`}
                          >
                            {hidePronounceAll ? '🔓 Buka Cara Baca' : '🔒 Tutup Cara Baca'}
                          </button>
                        </div>
                      </div>

                      {/* Batas Hafalan (Chunking) */}
                      <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                        <span className="text-indigo-300">Batas Tampil:</span>
                        <select 
                          value={chunkLimit}
                          onChange={(e) => setChunkLimit(Number(e.target.value))}
                          className="bg-indigo-900 border border-indigo-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 shadow-sm"
                        >
                          <option value="5">5 Kata</option>
                          <option value="10">10 Kata</option>
                          <option value="20">20 Kata</option>
                          <option value="999">Tampilkan Semua</option>
                        </select>
                      </div>

                    </div>
                    <p className="text-[10px] md:text-xs text-amber-300 italic flex items-start gap-1">
                      <span>💡</span> 
                      <span>Tips: Ketuk/tap langsung pada sel tabel yang tertutup (warna abu-abu/kuning) untuk mengintip isinya secara instan!</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Header List */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-slate-800">📋 Daftar Hafalan Kosakata Harian</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Total {filteredVocab.length} kata yang tersedia</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={handleOpenAddVocab}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm px-5 py-3 md:py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <span className="text-base">➕</span> Tambah Kosakata
                  </button>
                )}
              </div>

              {/* VIEW: TABEL HAFALAN MODE */}
              {viewMode === 'tabel_hafal' && filteredVocab.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                          <th className="p-4 text-center w-12 md:w-16">No</th>
                          <th className="p-4">Bahasa Indonesia</th>
                          <th className="p-4">Bahasa Inggris</th>
                          <th className="p-4">Cara Pelafalan (Pronunciation)</th>
                          <th className="p-4">Info/Kategori</th>
                          {role === 'admin' && <th className="p-4 text-center w-24 md:w-32">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                        {filteredVocab.slice(0, chunkLimit).map((vocab, index) => {
                          const isIndoHidden = hideIndoAll ? !revealedItems[`${vocab.id}_indo`] : revealedItems[`${vocab.id}_indo`];
                          const isEngHidden = hideEnglishAll ? !revealedItems[`${vocab.id}_eng`] : revealedItems[`${vocab.id}_eng`];
                          const isPronHidden = hidePronounceAll ? !revealedItems[`${vocab.id}_pron`] : revealedItems[`${vocab.id}_pron`];
                          
                          const altRowColors = [
                            'bg-emerald-50/20 hover:bg-emerald-50/60',
                            'bg-blue-50/20 hover:bg-blue-50/60',
                            'bg-indigo-50/20 hover:bg-indigo-50/60',
                            'bg-purple-50/20 hover:bg-purple-50/60',
                            'bg-amber-50/20 hover:bg-amber-50/60'
                          ];
                          const rowClass = altRowColors[index % altRowColors.length];

                          return (
                            <tr key={vocab.id} className={`${rowClass} transition duration-150`}>
                              
                              <td className="p-4 text-center font-bold text-slate-400 border-r border-slate-100/50">
                                {index + 1}
                              </td>

                              <td 
                                className="p-4 cursor-pointer select-none min-w-[140px]"
                                onClick={() => toggleIndividualReveal(vocab.id, 'indo')}
                              >
                                {isIndoHidden ? (
                                  <span className="inline-block w-full text-center px-4 py-2.5 bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200/50 animate-pulse text-[10px] md:text-xs shadow-sm">
                                    🔒 Ketuk untuk Intip
                                  </span>
                                ) : (
                                  <span className="font-extrabold text-slate-800 text-sm md:text-base whitespace-normal break-words">{vocab.indonesia}</span>
                                )}
                              </td>

                              <td 
                                className="p-4 cursor-pointer select-none border-l border-slate-100/50 min-w-[140px]"
                                onClick={() => toggleIndividualReveal(vocab.id, 'eng')}
                              >
                                {isEngHidden ? (
                                  <span className="inline-block w-full text-center px-4 py-2.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200/50 animate-pulse text-[10px] md:text-xs shadow-sm">
                                    🔒 Ketuk untuk Intip
                                  </span>
                                ) : (
                                  <span className="font-black text-indigo-700 text-base md:text-lg whitespace-normal break-words">{vocab.inggris}</span>
                                )}
                              </td>

                              <td 
                                className="p-4 cursor-pointer select-none border-l border-slate-100/50 min-w-[160px]"
                                onClick={() => toggleIndividualReveal(vocab.id, 'pron')}
                              >
                                {isPronHidden ? (
                                  <span className="inline-block px-3 py-2 bg-slate-100 text-slate-500 font-semibold rounded-lg border border-slate-200 text-[10px] md:text-xs">
                                    🔒 Ketuk untuk Baca
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-bold italic text-sm md:text-base">"{vocab.pronunciation || '-'}"</span>
                                )}
                              </td>

                              <td className="p-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                  <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">📅 {vocab.tanggal}</span>
                                  {vocab.kategori && (
                                    <span className="text-[10px] md:text-xs font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md uppercase">
                                      {vocab.kategori}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {role === 'admin' && (
                                <td className="p-4 text-center border-l border-slate-100/50">
                                  <div className="flex gap-2 justify-center">
                                    <button 
                                      onClick={() => handleOpenEditVocab(vocab)}
                                      className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors text-base"
                                      aria-label="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      onClick={() => triggerDeleteVocab(vocab.id)}
                                      className="p-2.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors text-base"
                                      aria-label="Hapus"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              )}

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredVocab.length > chunkLimit && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                      <p className="text-xs md:text-sm font-semibold text-slate-500">Menampilkan <span className="text-indigo-600 font-bold">{chunkLimit}</span> kata dari total <span className="text-indigo-600 font-bold">{filteredVocab.length}</span> kosakata.</p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: MODE KARTU LAMA */}
              {viewMode === 'kartu' && filteredVocab.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {filteredVocab.map((vocab) => (
                    <div 
                      key={vocab.id} 
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            📅 {vocab.tanggal}
                          </span>
                          {vocab.kategori && (
                            <span className="text-[10px] md:text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                              {vocab.kategori}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Bahasa Indonesia:</span>
                            <span className="text-base md:text-lg font-bold text-slate-800">{vocab.indonesia}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1 pt-3 border-t border-slate-50">
                            <span className="text-[10px] md:text-xs text-indigo-400 font-bold uppercase tracking-wider">English:</span>
                            <span className="text-lg md:text-xl font-extrabold text-indigo-600">{vocab.inggris}</span>
                          </div>

                          {vocab.pronunciation && (
                            <div className="text-xs md:text-sm text-slate-600 font-medium italic mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              📢 Cara baca: <span className="font-bold text-slate-800">"{vocab.pronunciation}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {role === 'admin' && (
                        <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => handleOpenEditVocab(vocab)}
                            className="text-xs md:text-sm text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-bold transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => triggerDeleteVocab(vocab.id)}
                            className="text-xs md:text-sm text-rose-500 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-bold transition-colors"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {filteredVocab.length === 0 && (
                <div className="bg-white rounded-2xl p-12 md:p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <span className="text-5xl md:text-6xl block mb-4">📭</span>
                  <h4 className="text-sm md:text-base font-bold text-slate-700">Daftar kata kosong atau tidak ditemukan</h4>
                  <p className="text-xs md:text-sm text-slate-500 mt-2 max-w-sm mx-auto">Coba sesuaikan kata kunci pencarian atau bersihkan filter tanggal dan kategori.</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: MULAI TES / KUIS (ADMIN ONLY) ==================== */}
          {activeTab === 'tes' && role === 'admin' && (
            <div className="space-y-6 animate-fadeIn w-full max-w-3xl mx-auto">
              
              {!isQuizActive && !quizResultsSummary && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 md:space-y-8">
                  <div className="text-center md:text-left">
                    <h3 className="text-base md:text-lg font-extrabold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                      <span className="text-2xl">🎯</span> Sesi Tes Hafalan Acak (Multiplayer)
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-2 md:mt-1">
                      Pilih peserta yang akan diuji kemampuannya secara bergiliran.
                    </p>
                  </div>

                  {/* Filter Tanggal Kuis */}
                  <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <span>📅</span> Batasi Kosakata Berdasarkan Tanggal (Opsional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5">Dari Tanggal</label>
                        <input
                          type="date"
                          value={quizStartDate}
                          onChange={(e) => setQuizStartDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs md:text-sm font-semibold transition-colors shadow-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5">Sampai Tanggal</label>
                        <input
                          type="date"
                          value={quizEndDate}
                          onChange={(e) => setQuizEndDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs md:text-sm font-semibold transition-colors shadow-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seleksi Peserta */}
                  <div>
                    <div className="flex justify-between items-end mb-3 md:mb-4 border-b border-slate-100 pb-2">
                      <span className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wide">Pilih Peserta ({selectedQuizMembers.length}):</span>
                      <button 
                        onClick={handleSelectAllQuizMembers}
                        className="text-xs md:text-sm text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {selectedQuizMembers.length === memberList.length ? 'Bersihkan Semua' : 'Pilih Semua'}
                      </button>
                    </div>

                    {memberList.length === 0 ? (
                      <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-100">
                        <p className="text-xs md:text-sm text-slate-500 italic">Belum ada peserta terdaftar. Silakan tambah anggota di menu Daftar Anggota.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {memberList.map((m) => {
                          const isSelected = selectedQuizMembers.includes(m.nama);
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleToggleSelectQuizMember(m.nama)}
                              className={`p-3 md:p-4 rounded-xl border text-sm md:text-base font-bold text-center transition-all duration-200 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 shadow-sm ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-700 ring-1 ring-indigo-400' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <span className="truncate w-full text-center sm:text-left">{m.nama}</span>
                              <span className="text-lg md:text-xl">{isSelected ? '✅' : '⚪'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={startQuiz}
                    disabled={selectedQuizMembers.length === 0}
                    className={`w-full py-4 md:py-5 rounded-2xl font-black text-sm md:text-base shadow-md transition-all ${
                      selectedQuizMembers.length > 0 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:opacity-90 hover:shadow-lg hover:-translate-y-1' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    🚀 Mulai Sesi Ujian Bergilir
                  </button>
                </div>
              )}

              {/* PLAYING KUIS */}
              {isQuizActive && currentQuestion && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-100 text-center space-y-8 max-w-lg mx-auto">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-[10px] md:text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                      ⚡ Kuis Berjalan
                    </span>
                    <button 
                      onClick={finishQuiz}
                      className="text-xs md:text-sm text-rose-600 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      🏁 Akhiri Sesi Tes
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] md:text-xs uppercase text-slate-400 font-extrabold tracking-widest">Giliran Menjawab:</p>
                    <div className="inline-block bg-amber-100 text-amber-800 px-6 py-2 rounded-2xl shadow-sm border border-amber-200">
                      <h4 className="text-2xl md:text-3xl font-black">
                        👤 {quizRound[currentQuizIndex]?.nama}
                      </h4>
                    </div>
                  </div>

                  <div className="p-8 md:p-10 bg-gradient-to-b from-slate-50 to-white rounded-3xl border-2 border-slate-100 shadow-inner space-y-4">
                    <p className="text-[11px] md:text-xs uppercase text-slate-500 font-bold tracking-widest">Terjemahkan kata ini:</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                      "{currentQuestion.indonesia}"
                    </h2>
                  </div>

                  <div className="min-h-[100px] flex items-center justify-center">
                    {!showAnswer ? (
                      <button 
                        onClick={() => setShowAnswer(true)}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-xs md:text-sm font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors border border-slate-200 border-dashed"
                      >
                        👁️ Ketuk di sini untuk intip kunci jawaban
                      </button>
                    ) : (
                      <div className="w-full p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-sm animate-fadeIn">
                        <p className="text-[10px] md:text-xs text-emerald-600 font-black uppercase tracking-wider mb-1">Kunci Jawaban:</p>
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-800">{currentQuestion.inggris}</p>
                        {currentQuestion.pronunciation && (
                          <p className="text-xs md:text-sm text-slate-600 italic font-medium mt-2">"{currentQuestion.pronunciation}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tombol Input */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="py-4 md:py-5 bg-white hover:bg-rose-50 text-rose-600 font-black rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-rose-200 transition-all active:scale-95 shadow-sm hover:shadow-md"
                    >
                      <span className="text-3xl md:text-4xl">❌</span>
                      <span className="text-xs md:text-sm uppercase tracking-wider">Salah</span>
                    </button>

                    <button
                      onClick={() => handleAnswer(true)}
                      className="py-4 md:py-5 bg-white hover:bg-emerald-50 text-emerald-600 font-black rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-emerald-200 transition-all active:scale-95 shadow-sm hover:shadow-md"
                    >
                      <span className="text-3xl md:text-4xl">✅</span>
                      <span className="text-xs md:text-sm uppercase tracking-wider">Benar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* LAPORAN HASIL KUIS */}
              {quizResultsSummary && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6 max-w-lg mx-auto animate-fadeIn">
                  <div className="text-center space-y-2 pb-4 border-b border-slate-100">
                    <span className="text-5xl md:text-6xl block mb-2">🎉</span>
                    <h3 className="text-xl md:text-2xl font-black text-slate-800">Sesi Ujian Selesai!</h3>
                    <p className="text-xs md:text-sm text-slate-500">Rincian nilai harian peserta yang berpartisipasi:</p>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto px-2">
                    {quizResultsSummary.map((res, idx) => (
                      <div key={idx} className="py-4 md:py-5 flex justify-between items-center group">
                        <div>
                          <h4 className="font-bold text-base md:text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{res.nama}</h4>
                          <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded mr-1">Benar: {res.benar}</span>
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded">Salah: {res.salah}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl md:text-3xl font-black ${
                            res.nilai >= 80 ? 'text-emerald-600' : 
                            res.nilai >= 60 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {res.nilai}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => { setQuizResultsSummary(null); setActiveTab('dashboard'); }}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm md:text-base shadow-md hover:shadow-lg transition-all"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB: GRAFIK & STATISTIK ==================== */}
          {activeTab === 'statistik' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn w-full max-w-5xl mx-auto">
              
              {/* MATRIKS KEHADIRAN / ABSENSI PESERTA */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-base md:text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <span className="text-xl md:text-2xl">📅</span> Matriks Kehadiran & Partisipasi
                    </h4>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Ketahui siapa saja yang bolos atau sudah mengikuti kuis hari ini.</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <input 
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-100 focus:outline-none focus:border-indigo-400 text-xs md:text-sm font-bold text-slate-700 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {familyAttendanceMatrix.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all hover:shadow-md ${
                        item.hadir 
                          ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200' 
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-sm md:text-base font-bold text-slate-800">{item.nama}</p>
                        <p className="text-[10px] md:text-xs text-slate-500 mt-1 font-medium">
                          {item.hadir ? `✅ Benar: ${item.benar} | ❌ Salah: ${item.salah}` : "⚠️ Belum Tes / Bolos"}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.hadir ? (
                          <span className="text-sm md:text-base font-black text-emerald-700 bg-emerald-100 px-3 py-1 md:py-1.5 rounded-xl border border-emerald-200">
                            {item.nilai}%
                          </span>
                        ) : (
                          <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 md:py-1.5 rounded-xl border border-slate-300 uppercase">
                            Absen
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PEMILIHAN GRAFIK INDIVIDUAL */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <span className="text-xl md:text-2xl">📈</span> Grafik Rapor Individual
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">Pilih nama untuk melihat riwayat grafik progres nilainya.</p>
                </div>
                <div className="w-full sm:w-64">
                  <select
                    value={selectedStatMember}
                    onChange={(e) => setSelectedStatMember(e.target.value)}
                    className="w-full px-4 py-3 md:py-2.5 rounded-xl border-2 border-indigo-100 focus:outline-none focus:border-indigo-400 text-xs md:text-sm text-slate-800 font-bold bg-white shadow-sm"
                  >
                    {memberList.map((m) => (
                      <option key={m.id} value={m.nama}>{m.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              {memberStats ? (
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 text-center shadow-sm hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">Nilai Hari Ini</p>
                      <p className="text-2xl md:text-3xl font-black text-indigo-600 mt-2">{memberStats.nilaiHariIni}</p>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 text-center shadow-sm hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">Nilai Kemarin</p>
                      <p className="text-2xl md:text-3xl font-black text-slate-600 mt-2">{memberStats.nilaiKemarin}</p>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 text-center shadow-sm hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">Rerata 7 Hari</p>
                      <p className="text-2xl md:text-3xl font-black text-emerald-600 mt-2">{memberStats.nilaiMingguIni}</p>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 text-center shadow-sm hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Rerata Skor</p>
                      <p className="text-2xl md:text-3xl font-black text-indigo-600 mt-2">{memberStats.rataRataNilai}%</p>
                    </div>
                  </div>

                  {/* GRAFIK PROGRES */}
                  <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                      <span className="text-2xl md:text-3xl">📊</span>
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-slate-800">
                          Grafik Batang Kemajuan
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">Riwayat tes atas nama <strong className="text-indigo-600">{selectedStatMember}</strong></p>
                      </div>
                    </div>

                    {memberStats.history.length === 0 ? (
                      <div className="py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                        <span className="text-4xl block mb-3 opacity-50">📉</span>
                        <p className="text-xs md:text-sm font-semibold text-slate-500">Belum ada riwayat tes terdaftar untuk peserta ini.</p>
                      </div>
                    ) : (
                      <div className="space-y-5 md:space-y-6">
                        {memberStats.history.map((h, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-end text-xs md:text-sm font-bold text-slate-600">
                              <span className="bg-slate-100 px-3 py-1 rounded-lg">📅 {h.tanggal}</span>
                              <span className={`text-base md:text-lg ${h.nilai >= 80 ? 'text-emerald-600' : h.nilai >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{h.nilai}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-4 md:h-5 rounded-full overflow-hidden flex shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                  h.nilai >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                  h.nilai >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                  'bg-gradient-to-r from-rose-400 to-rose-500'
                                }`} 
                                style={{ width: `${Math.max(h.nilai, 5)}%` }} // Ensure min width is visible
                              >
                                {/* Decorative highlight */}
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white opacity-20 w-1/2 rounded-full transform -skew-x-12 -translate-x-full animate-shimmer"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 md:p-12 text-center text-slate-400 rounded-3xl border border-slate-100 text-xs md:text-sm font-semibold">
                  Silakan buat atau pilih peserta terlebih dahulu pada dropdown di atas.
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB: DAFTAR ANGGOTA PESERTA (ADMIN ONLY) ==================== */}
          {activeTab === 'anggota' && role === 'admin' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn w-full max-w-4xl mx-auto">
              
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl md:text-3xl">👤</span>
                  <h3 className="text-base md:text-lg font-extrabold text-slate-800">Tambah Anggota Baru</h3>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-6">Peserta yang didaftarkan akan otomatis masuk dalam daftar pilihan sesi tes.</p>
                
                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text"
                    placeholder="Masukkan nama panggilan peserta..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-grow px-4 py-3.5 md:py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-semibold transition-colors shadow-sm"
                  />
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 md:py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Tambah Peserta
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-sm md:text-base font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100 flex justify-between items-center">
                  <span>Daftar Peserta Terdaftar</span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs">{memberList.length} Orang</span>
                </h3>
                
                {memberList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs md:text-sm italic">
                    Belum ada anggota yang terdaftar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {memberList.map((m) => (
                      <div key={m.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-200 hover:border-indigo-200 transition-colors group">
                        <span className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                          <span className="text-lg opacity-50">👤</span> {m.nama}
                        </span>
                        <button 
                          onClick={() => triggerDeleteMember(m.id, m.nama)}
                          className="text-xs md:text-sm text-rose-500 hover:text-white hover:bg-rose-500 font-bold px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </section>
      </main>

      {/* ==================== MODAL: ADMIN ACCESS GATEKEEPER ==================== */}
      {isAdminPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-slate-100 space-y-6 animate-slideDown">
            <div className="text-center space-y-2">
              <span className="text-4xl block mb-2">🔐</span>
              <h3 className="text-base md:text-lg font-extrabold text-slate-800">Otorisasi Admin Penguji</h3>
              <p className="text-xs md:text-sm text-slate-500">Aplikasi di bawah lisensi Johan Jauharudin. Silakan masukkan kata sandi.</p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input 
                  type="password"
                  placeholder="Masukkan Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 md:py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 text-center text-sm md:text-base font-bold tracking-widest shadow-sm"
                  required
                />
                {passwordError && (
                  <p className="text-xs text-rose-500 font-bold text-center mt-2 animate-pulse">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAdminPasswordOpen(false)}
                  className="flex-1 py-3 text-xs md:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-xs md:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT VOCABULARY ==================== */}
      {isVocabModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto animate-slideDown">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base md:text-lg font-extrabold text-slate-800 flex items-center gap-2">
                {editingVocab ? '✏️ Edit Kosakata' : '➕ Tambah Kosakata Baru'}
              </h3>
              <button 
                onClick={() => setIsVocabModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 font-bold text-xl md:text-2xl p-2 rounded-full hover:bg-rose-50 transition-colors"
              >
                ✕
              </button>
            </div>

            {!editingVocab && (
              <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs md:text-sm font-bold shadow-inner">
                <button 
                  onClick={() => setVocabModalTab('single')}
                  className={`flex-1 py-2.5 rounded-lg transition-all ${vocabModalTab === 'single' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Input Manual
                </button>
                <button 
                  onClick={() => setVocabModalTab('bulk')}
                  className={`flex-1 py-2.5 rounded-lg transition-all ${vocabModalTab === 'bulk' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Tempel Masal ✨
                </button>
              </div>
            )}

            {vocabModalTab === 'single' ? (
              <form onSubmit={handleSaveVocab} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tanggal Masuk</label>
                    <input 
                      type="date"
                      value={vocabForm.tanggal}
                      onChange={(e) => setVocabForm({...vocabForm, tanggal: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kategori</label>
                    <input 
                      type="text"
                      placeholder="Opsional..."
                      value={vocabForm.kategori}
                      onChange={(e) => setVocabForm({...vocabForm, kategori: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Bahasa Indonesia <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    placeholder="Contoh: Sikat Gigi"
                    value={vocabForm.indonesia}
                    onChange={(e) => setVocabForm({...vocabForm, indonesia: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Bahasa Inggris <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    placeholder="Contoh: Toothbrush"
                    value={vocabForm.inggris}
                    onChange={(e) => setVocabForm({...vocabForm, inggris: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cara Baca / Pronunciation</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Tuth-brasy"
                    value={vocabForm.pronunciation}
                    onChange={(e) => setVocabForm({...vocabForm, pronunciation: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold shadow-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsVocabModalOpen(false)}
                    className="px-5 py-2.5 text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Simpan Kosakata
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveBulkVocab} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tanggal Masuk</label>
                    <input 
                      type="date"
                      value={vocabForm.tanggal}
                      onChange={(e) => setVocabForm({...vocabForm, tanggal: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kategori Masal</label>
                    <input 
                      type="text"
                      placeholder="Semua kata masuk ke..."
                      value={vocabForm.kategori}
                      onChange={(e) => setVocabForm({...vocabForm, kategori: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wide">Area Teks (Paste Disini)</label>
                    <span className="text-[10px] text-slate-400">Format: Indo = Eng dibaca Pelafalan</span>
                  </div>
                  <textarea
                    rows={7}
                    placeholder="Contoh format:&#10;Mobil = Car Di Baca kar&#10;Jalan = Road Di Baca roud"
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 text-sm md:text-base font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                    required
                  ></textarea>
                </div>

                {parsedBulkVocabs.length > 0 && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 max-h-40 overflow-y-auto shadow-inner">
                    <h4 className="text-xs md:text-sm font-extrabold text-emerald-800 mb-2 flex justify-between">
                      <span>✅ Pratinjau Terdeteksi:</span>
                      <span className="bg-emerald-200 text-emerald-800 px-2 rounded-md">{parsedBulkVocabs.length} kata</span>
                    </h4>
                    <div className="space-y-1.5 text-xs md:text-sm">
                      {parsedBulkVocabs.map((v, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between bg-white p-2 rounded-lg border border-emerald-100 shadow-sm gap-1 sm:gap-0">
                          <span className="font-semibold text-slate-700">🇮🇩 {v.indonesia}</span>
                          <span className="text-indigo-700 font-extrabold">🇬🇧 {v.inggris}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsVocabModalOpen(false)}
                    className="px-5 py-2.5 text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={parsedBulkVocabs.length === 0}
                    className={`font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md ${
                      parsedBulkVocabs.length > 0 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Simpan Semua ({parsedBulkVocabs.length})
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ==================== CUSTOM DIALOG: CONFIRMATION ==================== */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-slate-100 text-center space-y-5 animate-slideDown">
            <span className="text-5xl md:text-6xl block">⚠️</span>
            <h4 className="text-base md:text-lg font-black text-slate-800">{confirmDialog.title}</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">{confirmDialog.message}</p>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-3 text-xs md:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-3 text-xs md:text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-md hover:shadow-lg animate-pulseOnce"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CUSTOM DIALOG: NOTIFICATION BANNER ==================== */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800/95 backdrop-blur text-white py-3 px-6 rounded-2xl shadow-2xl z-[60] flex items-center gap-3 text-xs md:text-sm font-bold border border-slate-700 animate-slideDown w-[90%] sm:w-auto max-w-md">
          <span className="text-lg md:text-xl">
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="flex-1 leading-snug">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full p-1.5 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* FOOTER BRANDING FOR LARGER SCREEN & MOBILE NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe pt-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center md:hidden z-40">
        {role === 'admin' && (
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">📊</span>
            <span className="text-[10px]">Dashboard</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('hafalan')}
          className={`flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-colors ${activeTab === 'hafalan' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="text-xl">📖</span>
          <span className="text-[10px]">Hafalan</span>
        </button>
        {role === 'admin' && (
          <button 
            onClick={() => setActiveTab('tes')}
            className={`flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-colors ${activeTab === 'tes' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">🎯</span>
            <span className="text-[10px]">Tes Acak</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('statistik')}
          className={`flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-colors ${activeTab === 'statistik' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="text-xl">📈</span>
          <span className="text-[10px]">Statistik</span>
        </button>
        {role === 'admin' && (
          <button 
            onClick={() => setActiveTab('anggota')}
            className={`flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-colors ${activeTab === 'anggota' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">👥</span>
            <span className="text-[10px]">Anggota</span>
          </button>
        )}
      </footer>

      {/* BRANDING BOTTOM SIGNATURE (Desktop Only) */}
      <div className="hidden md:block bg-slate-900 text-slate-300 text-center py-3 text-xs font-medium border-t border-slate-950 mt-auto">
        Branded & Developed by <span className="text-amber-400 font-black decoration-amber-400 underline tracking-wide">Johan Jauharudin</span> <span className="mx-2 opacity-50">|</span> © 2026 Jauharudin Digital Excellence
      </div>

    </div>
  );
}