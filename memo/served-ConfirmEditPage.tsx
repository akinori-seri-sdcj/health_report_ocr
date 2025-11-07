import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/ConfirmEditPage.tsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=24f718de"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/app/src/pages/ConfirmEditPage.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=24f718de"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=8b50c0bc";
import { useSessionStore } from "/src/store/sessionStore.ts";
import { useOCRResultStore } from "/src/store/ocrResultStore.ts";
import { processHealthReport } from "/src/api/healthReportApi.ts";
import ExportModal from "/src/components/ExportModal.tsx";
export const ConfirmEditPage = () => {
  _s();
  const navigate = useNavigate();
  const { currentImages, currentSession, createSession, loadSession, addImage } = useSessionStore();
  const {
    ocrResult,
    isProcessing,
    error,
    setOCRResult,
    setProcessing,
    setError,
    updatePatientInfo,
    updateExaminationItem,
    deleteExaminationItem
  } = useOCRResultStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);
  const [exportError, setExportError] = useState(null);
  useEffect(() => {
    let mounted = true;
    const initSession = async () => {
      const savedSessionId = localStorage.getItem("currentSessionId");
      if (savedSessionId) {
        console.log("[ConfirmEditPage] a?Åëa-?a?Å‚a??a?ÅEa?Åòa?3a??a?ca??:", savedSessionId);
        await loadSession(savedSessionId);
        if (!currentSession) {
          console.log("[ConfirmEditPage] a?Å‚a??a?ÅEa?Åòa?3a??e|?a??a??a??a?aa??a??a??a?Åãe|?a??a??");
          localStorage.removeItem("currentSessionId");
          const newSessionId = await createSession();
          localStorage.setItem("currentSessionId", newSessionId);
        }
      } else if (!currentSession) {
        console.log("[ConfirmEditPage] a?Åãa??a??a?Å‚a??a?ÅEa?Åòa?3a??a??a??");
        const newSessionId = await createSession();
        localStorage.setItem("currentSessionId", newSessionId);
      }
      if (mounted) {
        setIsInitializing(false);
      }
    };
    initSession();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!isInitializing && currentSession) {
      console.log("[ConfirmEditPage] a?Å‚a??a?ÅEa?Åòa?3ea-a??e??a??aR?ao?:", currentImages.length, "a??");
    }
  }, [isInitializing, currentSession, currentImages]);
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    console.log("[ConfirmEditPage] a??a?!a??a?Å·a?Åëa??a??a?-a??a??:", files.length, "aÅ‚Å˜");
    if (!currentSession) {
      console.log("[ConfirmEditPage] a?Å‚a??a?ÅEa?Åòa?3a??a?aa??a??a??a??a??a??a??a??");
      const newSessionId = await createSession();
      localStorage.setItem("currentSessionId", newSessionId);
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        await addImage(file);
      }
    }
  };
  const handleStartOCR = async () => {
    if (currentImages.length === 0) {
      alert("c?Å‚a??a??a??a??a??a??a??");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const imageBlobs = currentImages.map((img) => img.imageData);
      const result = await processHealthReport(imageBlobs);
      setOCRResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "OCRa?|c??a?Å·a?Å}a??a??a??a??a??";
      setError(errorMessage);
      console.error("[ConfirmEditPage] OCRa?|c??a?ÅNa?ca??:", err);
    }
  };
  const handlePatientInfoChange = (field, value) => {
    if (!ocrResult) return;
    if (field === "aÅã?a??") {
      updatePatientInfo(value, ocrResult.a??eÅNoeÄ?a??a?Å}.a??eÅNoa?\);
    } else {
      updatePatientInfo(ocrResult.a??eÅNoeÄ?a??a?Å}.aÅã?a??, value);
    }
  };
  const handleItemChange = (index, field, value) => {
    if (!ocrResult) return;
    const item = { ...ocrResult.a??a?Å‚cÉ ?a??[index] };
    if (field === "a??a??" || field === "a??aR?") {
      item[field] = value || null;
    } else {
      item[field] = value;
    }
    updateExaminationItem(index, item);
  };
  const handleProceedToExcel = () => {
    if (!ocrResult) {
      alert("OCRcÉ ?a??a??a??a??a??a??a??");
      return;
    }
    localStorage.removeItem("currentSessionId");
    navigate("/generate-excel");
  };
  const handleOpenExport = () => setExportOpen(true);
  const handleCloseExport = () => setExportOpen(false);
  const handleConfirmExport = (format) => {
    setExportMessage(`Export (${format}) is not implemented in this build.`);
    setExportError(null);
    setExportOpen(false);
  };
  const handleCancelExport = () => {
    setExportMessage("Export canceled.");
    setExportError(null);
  };
  const handleBackToCamera = () => {
    navigate("/camera");
  };
  console.log("[ConfirmEditPage] a?Å a?3a?Äa?aa?3a?Åã:", {
    ocrResult: ocrResult ? "a??a??" : "a?aa??",
    a??a?Å‚cÉ ?a??aÅ‚Å˜a?Åã: ocrResult?.a??a?Å‚cÉ ?a???.length || 0,
    isProcessing,
    error
  });
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxDEV("header", { className: "bg-white shadow-sm", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-gray-900", children: "cÅëoea?a?Å‚cÅEÅNe??" }, void 0, false, {
        fileName: "/app/src/pages/ConfirmEditPage.tsx",
        lineNumber: 241,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: handleBackToCamera,
          className: "text-gray-600 hover:text-gray-900",
          children: "a?? a?Å·a?!a?ca?Å·a?Å‚a??"
        },
        void 0,
        false,
        {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 242,
          columnNumber: 13
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 240,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 239,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 238,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { className: "max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8", children: [
      exportMessage && /* @__PURE__ */ jsxDEV("div", { className: "mb-4 bg-blue-50 text-blue-700 px-4 py-2 rounded", children: exportMessage }, void 0, false, {
        fileName: "/app/src/pages/ConfirmEditPage.tsx",
        lineNumber: 255,
        columnNumber: 9
      }, this),
      exportError && /* @__PURE__ */ jsxDEV("div", { className: "mb-4 bg-red-50 text-red-700 px-4 py-2 rounded", children: exportError }, void 0, false, {
        fileName: "/app/src/pages/ConfirmEditPage.tsx",
        lineNumber: 258,
        columnNumber: 9
      }, this),
      isInitializing && /* @__PURE__ */ jsxDEV("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" }, void 0, false, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 263,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-gray-600", children: "ea-a??e??a??aÅC-..." }, void 0, false, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 264,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/pages/ConfirmEditPage.tsx",
        lineNumber: 262,
        columnNumber: 9
      }, this),
      !isInitializing && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold", children: "a?Ra?Å}a??a??c?Å‚a??" }, void 0, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 273,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("label", { className: "cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition", children: [
              /* @__PURE__ */ jsxDEV(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  multiple: true,
                  onChange: handleFileUpload,
                  className: "hidden"
                },
                void 0,
                false,
                {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 277,
                  columnNumber: 19
                },
                this
              ),
              "d??? c?Å‚a??a??e??a??"
            ] }, void 0, true, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 276,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                disabled: !(ocrResult && (ocrResult.a??a?Å‚cÉ ?a???.length || 0) > 0),
                onClick: handleOpenExport,
                className: "ml-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50",
                children: "Export"
              },
              void 0,
              false,
              {
                fileName: "/app/src/pages/ConfirmEditPage.tsx",
                lineNumber: 288,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 272,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: currentImages.map(
            (image, index) => /* @__PURE__ */ jsxDEV(ImageThumbnail, { image, index }, image.id, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 300,
              columnNumber: 15
            }, this)
          ) }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 298,
            columnNumber: 15
          }, this),
          currentImages.length === 0 && /* @__PURE__ */ jsxDEV("div", { className: "text-center py-8 text-gray-500", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: "c?Å‚a??a??a??a??a??a??a??" }, void 0, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 307,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm", children: "aÄ?c?Å‚a??a??e??a??aÄ?a??a??a?3a??a??a?\aoÅEeÅNoa?-cÉ ?a??a?Rc?Å‚a??a??a?Åëa??a??a?-a??a??a??a?|a??a??a??a??" }, void 0, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 308,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 306,
            columnNumber: 13
          }, this),
          !ocrResult && currentImages.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "mt-6", children: /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleStartOCR,
              disabled: isProcessing,
              className: `w-full py-3 rounded-lg font-bold text-lg transition ${isProcessing ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`,
              children: isProcessing ? "a?|c??aÅC-..." : "OCRa?|c??a??e??aÅò?"
            },
            void 0,
            false,
            {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 315,
              columnNumber: 19
            },
            this
          ) }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 314,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 271,
          columnNumber: 13
        }, this),
        isProcessing && /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-lg shadow p-6 mb-6", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 334,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-gray-600", children: "OCRa?|c??aÅC-a?Åòa??aÄ?a??a?Åãa??a??a??a??a?!a??a??a??a??..." }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 335,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 333,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 332,
          columnNumber: 11
        }, this),
        error && /* @__PURE__ */ jsxDEV("section", { className: "bg-red-50 border border-red-200 rounded-lg p-6 mb-6", children: [
          /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold text-red-800 mb-2", children: "a?ÅNa?ca??" }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 343,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-red-600", children: error }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 344,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleStartOCR,
              className: "mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600",
              children: "a??ec|e!?"
            },
            void 0,
            false,
            {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 345,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 342,
          columnNumber: 11
        }, this),
        ocrResult && /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [
            /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold mb-4", children: "a??eÅNoeÄ?a??a?Å}" }, void 0, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 359,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "aÅã?a??" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 362,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "text",
                    value: ocrResult.a??eÅNoeÄ?a??a?Å}?.aÅã?a?? || "",
                    onChange: (e) => handlePatientInfoChange("aÅã?a??", e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900",
                    placeholder: "aÅã?a??a??a??a?oa??a??a?aa??a?Åía??a?ÅLa??a?ÅPa??a?\a??a??a?|a??a??a??a??"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 365,
                    columnNumber: 19
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/src/pages/ConfirmEditPage.tsx",
                lineNumber: 361,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "a??eÅNoa?\" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 374,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "date",
                    value: ocrResult.a??eÅNoeÄ?a??a?Å}?.a??eÅNoa?\ || "",
                    onChange: (e) => handlePatientInfoChange("a??eÅNoa?\", e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900",
                    placeholder: "a??eÅNoa?\a??a??a?oa??a??a?aa??a?Åía??a?ÅLa??a?ÅPa??a?\a??a??a?|a??a??a??a??"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 377,
                    columnNumber: 19
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/src/pages/ConfirmEditPage.tsx",
                lineNumber: 373,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 360,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 358,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [
            /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold mb-4", children: "a??a?Å‚cÉ ?a??" }, void 0, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 390,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "min-w-full divide-y divide-gray-200", children: [
              /* @__PURE__ */ jsxDEV("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxDEV("tr", { children: [
                /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "e??c?Ra??" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 395,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "aÄ?" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 398,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "a??a??" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 401,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "a??aR?" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 404,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "a??a??" }, void 0, false, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 407,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/app/src/pages/ConfirmEditPage.tsx",
                lineNumber: 394,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/app/src/pages/ConfirmEditPage.tsx",
                lineNumber: 393,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("tbody", { className: "bg-white divide-y divide-gray-200", children: ocrResult.a??a?Å‚cÉ ?a???.map(
                (item, index) => /* @__PURE__ */ jsxDEV("tr", { className: "hover:bg-gray-50", children: [
                  /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(
                    "input",
                    {
                      type: "text",
                      value: item.e??c?Ra?? || "",
                      onChange: (e) => handleItemChange(index, "e??c?Ra??", e.target.value),
                      className: "w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/src/pages/ConfirmEditPage.tsx",
                      lineNumber: 416,
                      columnNumber: 27
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 415,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(
                    "input",
                    {
                      type: "text",
                      value: item.aÄ? || "",
                      onChange: (e) => handleItemChange(index, "aÄ?", e.target.value),
                      className: "w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/src/pages/ConfirmEditPage.tsx",
                      lineNumber: 426,
                      columnNumber: 27
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 425,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(
                    "input",
                    {
                      type: "text",
                      value: item.a??a?? || "",
                      onChange: (e) => handleItemChange(index, "a??a??", e.target.value),
                      className: "w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/src/pages/ConfirmEditPage.tsx",
                      lineNumber: 434,
                      columnNumber: 27
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 433,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(
                    "input",
                    {
                      type: "text",
                      value: item.a??aR? || "",
                      onChange: (e) => handleItemChange(index, "a??aR?", e.target.value),
                      className: "w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-gray-900"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/src/pages/ConfirmEditPage.tsx",
                      lineNumber: 442,
                      columnNumber: 27
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 441,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      onClick: () => {
                        if (confirm("a??a?Re??c?Ra??a??e??a??a??a??a??i??")) {
                          deleteExaminationItem(index);
                        }
                      },
                      className: "text-red-500 hover:text-red-700",
                      children: "a??e??"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/src/pages/ConfirmEditPage.tsx",
                      lineNumber: 450,
                      columnNumber: 27
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/src/pages/ConfirmEditPage.tsx",
                    lineNumber: 449,
                    columnNumber: 25
                  }, this)
                ] }, index, true, {
                  fileName: "/app/src/pages/ConfirmEditPage.tsx",
                  lineNumber: 414,
                  columnNumber: 21
                }, this)
              ) }, void 0, false, {
                fileName: "/app/src/pages/ConfirmEditPage.tsx",
                lineNumber: 412,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 392,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 391,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 389,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleProceedToExcel,
              className: "px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition",
              children: "cÅëoaR?a??a?|Excelc??a??a?ÅC a??"
            },
            void 0,
            false,
            {
              fileName: "/app/src/pages/ConfirmEditPage.tsx",
              lineNumber: 470,
              columnNumber: 19
            },
            this
          ) }, void 0, false, {
            fileName: "/app/src/pages/ConfirmEditPage.tsx",
            lineNumber: 469,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/app/src/pages/ConfirmEditPage.tsx",
          lineNumber: 356,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/pages/ConfirmEditPage.tsx",
        lineNumber: 270,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 252,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(ExportModal, { open: exportOpen, onClose: handleCloseExport, onConfirm: handleConfirmExport, onCancel: handleCancelExport }, void 0, false, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 484,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/app/src/pages/ConfirmEditPage.tsx",
    lineNumber: 236,
    columnNumber: 5
  }, this);
};
_s(ConfirmEditPage, "GfPVALTuSpu+Ve3S90qj/PsJ9dg=", false, function() {
  return [useNavigate, useSessionStore, useOCRResultStore];
});
_c = ConfirmEditPage;
const ImageThumbnail = ({ image, index }) => {
  _s2();
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(image.imageData);
    setImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image.imageData]);
  return /* @__PURE__ */ jsxDEV("div", { className: "relative aspect-video bg-gray-200 rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV("img", { src: imageUrl, alt: `c?Å‚a?? ${index + 1}`, className: "w-full h-full object-cover" }, void 0, false, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 511,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold", children: index + 1 }, void 0, false, {
      fileName: "/app/src/pages/ConfirmEditPage.tsx",
      lineNumber: 512,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/app/src/pages/ConfirmEditPage.tsx",
    lineNumber: 510,
    columnNumber: 5
  }, this);
};
_s2(ImageThumbnail, "KjMZRZCO4mLZUizaO9kQ3A3TUQU=");
_c2 = ImageThumbnail;
var _c, _c2;
$RefreshReg$(_c, "ConfirmEditPage");
$RefreshReg$(_c2, "ImageThumbnail");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/app/src/pages/ConfirmEditPage.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/app/src/pages/ConfirmEditPage.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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QUFDLFNBQUksS0FBS21DLFVBQVUsS0FBSyxNQUFNdEIsUUFBUSxDQUFDLElBQUksV0FBVSxnQ0FBdEQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFrRjtBQUFBLElBQ2xGLHVCQUFDLFNBQUksV0FBVSxvRkFDWkEsa0JBQVEsS0FEWDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBRUE7QUFBQSxPQUpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FLQTtBQUVKO0FBQUNxQixJQXBCS0QsZ0JBQTZDO0FBQUFRLE1BQTdDUjtBQUE2QyxJQUFBRCxJQUFBUztBQUFBQyxhQUFBVixJQUFBO0FBQUFVLGFBQUFELEtBQUEiLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZU5hdmlnYXRlIiwidXNlU2Vzc2lvblN0b3JlIiwidXNlT0NSUmVzdWx0U3RvcmUiLCJwcm9jZXNzSGVhbHRoUmVwb3J0IiwiRXhwb3J0TW9kYWwiLCJDb25maXJtRWRpdFBhZ2UiLCJfcyIsIm5hdmlnYXRlIiwiY3VycmVudEltYWdlcyIsImN1cnJlbnRTZXNzaW9uIiwiY3JlYXRlU2Vzc2lvbiIsImxvYWRTZXNzaW9uIiwiYWRkSW1hZ2UiLCJvY3JSZXN1bHQiLCJpc1Byb2Nlc3NpbmciLCJlcnJvciIsInNldE9DUlJlc3VsdCIsInNldFByb2Nlc3NpbmciLCJzZXRFcnJvciIsInVwZGF0ZVBhdGllbnRJbmZvIiwidXBkYXRlRXhhbWluYXRpb25JdGVtIiwiZGVsZXRlRXhhbWluYXRpb25JdGVtIiwiaXNJbml0aWFsaXppbmciLCJzZXRJc0luaXRpYWxpemluZyIsImV4cG9ydE9wZW4iLCJzZXRFeHBvcnRPcGVuIiwiZXhwb3J0TWVzc2FnZSIsInNldEV4cG9ydE1lc3NhZ2UiLCJleHBvcnRFcnJvciIsInNldEV4cG9ydEVycm9yIiwibW91bnRlZCIsImluaXRTZXNzaW9uIiwic2F2ZWRTZXNzaW9uSWQiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiY29uc29sZSIsImxvZyIsInJlbW92ZUl0ZW0iLCJuZXdTZXNzaW9uSWQiLCJzZXRJdGVtIiwibGVuZ3RoIiwiaGFuZGxlRmlsZVVwbG9hZCIsImV2ZW50IiwiZmlsZXMiLCJ0YXJnZXQiLCJpIiwiZmlsZSIsInR5cGUiLCJzdGFydHNXaXRoIiwiaGFuZGxlU3RhcnRPQ1IiLCJhbGVydCIsImltYWdlQmxvYnMiLCJtYXAiLCJpbWciLCJpbWFnZURhdGEiLCJyZXN1bHQiLCJlcnIiLCJlcnJvck1lc3NhZ2UiLCJFcnJvciIsIm1lc3NhZ2UiLCJoYW5kbGVQYXRpZW50SW5mb0NoYW5nZSIsImZpZWxkIiwidmFsdWUiLCLlj5foqLrogIXmg4XloLEiLCLlj5foqLrml6UiLCLmsI/lkI0iLCJoYW5kbGVJdGVtQ2hhbmdlIiwiaW5kZXgiLCJpdGVtIiwi5qSc5p+757WQ5p6cIiwiaGFuZGxlUHJvY2VlZFRvRXhjZWwiLCJoYW5kbGVPcGVuRXhwb3J0IiwiaGFuZGxlQ2xvc2VFeHBvcnQiLCJoYW5kbGVDb25maXJtRXhwb3J0IiwiZm9ybWF0IiwiaGFuZGxlQ2FuY2VsRXhwb3J0IiwiaGFuZGxlQmFja1RvQ2FtZXJhIiwi5qSc5p+757WQ5p6c5Lu25pWwIiwiaW1hZ2UiLCJpZCIsImUiLCLpoIXnm67lkI0iLCLlgKQiLCLljZjkvY0iLCLliKTlrpoiLCJjb25maXJtIiwiX2MiLCJJbWFnZVRodW1ibmFpbCIsIl9zMiIsImltYWdlVXJsIiwic2V0SW1hZ2VVcmwiLCJ1cmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJyZXZva2VPYmplY3RVUkwiLCJfYzIiLCIkUmVmcmVzaFJlZyQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQ29uZmlybUVkaXRQYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXHJcbmltcG9ydCB7IHVzZVNlc3Npb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3Nlc3Npb25TdG9yZSdcclxuaW1wb3J0IHsgdXNlT0NSUmVzdWx0U3RvcmUgfSBmcm9tICcuLi9zdG9yZS9vY3JSZXN1bHRTdG9yZSdcclxuaW1wb3J0IHsgcHJvY2Vzc0hlYWx0aFJlcG9ydCB9IGZyb20gJy4uL2FwaS9oZWFsdGhSZXBvcnRBcGknXHJcbmltcG9ydCBFeHBvcnRNb2RhbCBmcm9tICcuLi9jb21wb25lbnRzL0V4cG9ydE1vZGFsJ1xyXG5cclxuLyoqXHJcbiAqIOeiuuiqjeODu+e3qOmbhueUu+mdolxyXG4gKlxyXG4gKiDmkq7lvbHjgZfjgZ/nlLvlg4/jgpJPQ1Llh6bnkIbjgZfjgIHntZDmnpzjgpLnorroqo3jg7vnt6jpm4bjgZnjgotcclxuICovXHJcbmV4cG9ydCBjb25zdCBDb25maXJtRWRpdFBhZ2U6IFJlYWN0LkZDID0gKCkgPT4ge1xyXG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKVxyXG5cclxuICAvLyDjgrvjg4Pjgrfjg6fjg7Pmg4XloLFcclxuICBjb25zdCB7IGN1cnJlbnRJbWFnZXMsIGN1cnJlbnRTZXNzaW9uLCBjcmVhdGVTZXNzaW9uLCBsb2FkU2Vzc2lvbiwgYWRkSW1hZ2UgfSA9IHVzZVNlc3Npb25TdG9yZSgpXHJcblxyXG4gIC8vIE9DUue1kOaenFxyXG4gIGNvbnN0IHtcclxuICAgIG9jclJlc3VsdCxcclxuICAgIGlzUHJvY2Vzc2luZyxcclxuICAgIGVycm9yLFxyXG4gICAgc2V0T0NSUmVzdWx0LFxyXG4gICAgc2V0UHJvY2Vzc2luZyxcclxuICAgIHNldEVycm9yLFxyXG4gICAgdXBkYXRlUGF0aWVudEluZm8sXHJcbiAgICB1cGRhdGVFeGFtaW5hdGlvbkl0ZW0sXHJcbiAgICBkZWxldGVFeGFtaW5hdGlvbkl0ZW0sXHJcbiAgfSA9IHVzZU9DUlJlc3VsdFN0b3JlKClcclxuXHJcbiAgLy8g5Yid5pyf5YyW54q25oWLXHJcbiAgY29uc3QgW2lzSW5pdGlhbGl6aW5nLCBzZXRJc0luaXRpYWxpemluZ10gPSB1c2VTdGF0ZSh0cnVlKVxyXG4gIGNvbnN0IFtleHBvcnRPcGVuLCBzZXRFeHBvcnRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtleHBvcnRNZXNzYWdlLCBzZXRFeHBvcnRNZXNzYWdlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG5cclxuICAvLyDjgrvjg4Pjgrfjg6fjg7Pjga7liJ3mnJ/ljJZcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbGV0IG1vdW50ZWQgPSB0cnVlXHJcblxyXG4gICAgY29uc3QgaW5pdFNlc3Npb24gPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIC8vIOOCu+ODg+OCt+ODp+ODs0lE44KSbG9jYWxTdG9yYWdl44GL44KJ5Y+W5b6XXHJcbiAgICAgIGNvbnN0IHNhdmVkU2Vzc2lvbklkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1cnJlbnRTZXNzaW9uSWQnKVxyXG5cclxuICAgICAgaWYgKHNhdmVkU2Vzc2lvbklkKSB7XHJcbiAgICAgICAgLy8g5pei5a2Y44K744OD44K344On44Oz44KS6Kqt44G/6L6844G/XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tDb25maXJtRWRpdFBhZ2VdIOaXouWtmOOCu+ODg+OCt+ODp+ODs+OCkuW+qeWFgzonLCBzYXZlZFNlc3Npb25JZClcclxuICAgICAgICBhd2FpdCBsb2FkU2Vzc2lvbihzYXZlZFNlc3Npb25JZClcclxuXHJcbiAgICAgICAgLy8g44K744OD44K344On44Oz44Gu6Kqt44G/6L6844G/44Gr5aSx5pWX44GX44Gf5aC05ZCI44Gv5paw6KaP5L2c5oiQXHJcbiAgICAgICAgaWYgKCFjdXJyZW50U2Vzc2lvbikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1tDb25maXJtRWRpdFBhZ2VdIOOCu+ODg+OCt+ODp+ODs+OBjOimi+OBpOOBi+OCieOBquOBhOOBn+OCgeaWsOimj+S9nOaIkCcpXHJcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3VycmVudFNlc3Npb25JZCcpXHJcbiAgICAgICAgICBjb25zdCBuZXdTZXNzaW9uSWQgPSBhd2FpdCBjcmVhdGVTZXNzaW9uKClcclxuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50U2Vzc2lvbklkJywgbmV3U2Vzc2lvbklkKVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICghY3VycmVudFNlc3Npb24pIHtcclxuICAgICAgICAvLyDmlrDjgZfjgYTjgrvjg4Pjgrfjg6fjg7PjgpLkvZzmiJBcclxuICAgICAgICBjb25zb2xlLmxvZygnW0NvbmZpcm1FZGl0UGFnZV0g5paw44GX44GE44K744OD44K344On44Oz44KS5L2c5oiQJylcclxuICAgICAgICBjb25zdCBuZXdTZXNzaW9uSWQgPSBhd2FpdCBjcmVhdGVTZXNzaW9uKClcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudFNlc3Npb25JZCcsIG5ld1Nlc3Npb25JZClcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG1vdW50ZWQpIHtcclxuICAgICAgICBzZXRJc0luaXRpYWxpemluZyhmYWxzZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGluaXRTZXNzaW9uKClcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkID0gZmFsc2VcclxuICAgIH1cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcclxuICB9LCBbXSlcclxuXHJcbiAgLy8g44K744OD44K344On44Oz6Kqt44G/6L6844G/5a6M5LqG44KS44Ot44Kw5Ye65YqbXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghaXNJbml0aWFsaXppbmcgJiYgY3VycmVudFNlc3Npb24pIHtcclxuICAgICAgY29uc29sZS5sb2coJ1tDb25maXJtRWRpdFBhZ2VdIOOCu+ODg+OCt+ODp+ODs+iqreOBv+i+vOOBv+WujOS6hjonLCBjdXJyZW50SW1hZ2VzLmxlbmd0aCwgJ+aemicpXHJcbiAgICB9XHJcbiAgfSwgW2lzSW5pdGlhbGl6aW5nLCBjdXJyZW50U2Vzc2lvbiwgY3VycmVudEltYWdlc10pXHJcblxyXG4gIC8qKlxyXG4gICAqIOODleOCoeOCpOODq+OCouODg+ODl+ODreODvOODiVxyXG4gICAqL1xyXG4gIGNvbnN0IGhhbmRsZUZpbGVVcGxvYWQgPSBhc3luYyAoZXZlbnQ6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XHJcbiAgICBjb25zdCBmaWxlcyA9IGV2ZW50LnRhcmdldC5maWxlc1xyXG4gICAgaWYgKCFmaWxlcyB8fCBmaWxlcy5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdbQ29uZmlybUVkaXRQYWdlXSDjg5XjgqHjgqTjg6vjgqLjg4Pjg5fjg63jg7zjg4k6JywgZmlsZXMubGVuZ3RoLCAn5Lu2JylcclxuXHJcbiAgICAvLyDjgrvjg4Pjgrfjg6fjg7PjgYzlrZjlnKjjgZfjgarjgYTloLTlkIjjga/kvZzmiJBcclxuICAgIGlmICghY3VycmVudFNlc3Npb24pIHtcclxuICAgICAgY29uc29sZS5sb2coJ1tDb25maXJtRWRpdFBhZ2VdIOOCu+ODg+OCt+ODp+ODs+OBjOOBquOBhOOBn+OCgeS9nOaIkOOBl+OBvuOBmScpXHJcbiAgICAgIGNvbnN0IG5ld1Nlc3Npb25JZCA9IGF3YWl0IGNyZWF0ZVNlc3Npb24oKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudFNlc3Npb25JZCcsIG5ld1Nlc3Npb25JZClcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5XjgqHjgqTjg6vjgpJCbG9i44Go44GX44Gm6L+95YqgXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1tpXVxyXG4gICAgICBpZiAoZmlsZS50eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XHJcbiAgICAgICAgYXdhaXQgYWRkSW1hZ2UoZmlsZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT0NS5Yem55CG44KS6ZaL5aeLXHJcbiAgICovXHJcbiAgY29uc3QgaGFuZGxlU3RhcnRPQ1IgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoY3VycmVudEltYWdlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgYWxlcnQoJ+eUu+WDj+OBjOOBguOCiuOBvuOBm+OCkycpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHNldFByb2Nlc3NpbmcodHJ1ZSlcclxuICAgIHNldEVycm9yKG51bGwpXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gQmxvYumFjeWIl+OCkuWPluW+l1xyXG4gICAgICBjb25zdCBpbWFnZUJsb2JzID0gY3VycmVudEltYWdlcy5tYXAoKGltZykgPT4gaW1nLmltYWdlRGF0YSlcclxuXHJcbiAgICAgIC8vIOODkOODg+OCr+OCqOODs+ODiUFQSeOBq+ODquOCr+OCqOOCueODiFxyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcm9jZXNzSGVhbHRoUmVwb3J0KGltYWdlQmxvYnMpXHJcblxyXG4gICAgICAvLyDntZDmnpzjgpLkv53lrZhcclxuICAgICAgc2V0T0NSUmVzdWx0KHJlc3VsdClcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ09DUuWHpueQhuOBq+WkseaVl+OBl+OBvuOBl+OBnydcclxuICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKVxyXG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlybUVkaXRQYWdlXSBPQ1Llh6bnkIbjgqjjg6njg7w6JywgZXJyKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog5Y+X6Ki66ICF5oOF5aCx44Gu57eo6ZuGXHJcbiAgICovXHJcbiAgY29uc3QgaGFuZGxlUGF0aWVudEluZm9DaGFuZ2UgPSAoZmllbGQ6ICfmsI/lkI0nIHwgJ+WPl+iouuaXpScsIHZhbHVlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmICghb2NyUmVzdWx0KSByZXR1cm5cclxuXHJcbiAgICBpZiAoZmllbGQgPT09ICfmsI/lkI0nKSB7XHJcbiAgICAgIHVwZGF0ZVBhdGllbnRJbmZvKHZhbHVlLCBvY3JSZXN1bHQu5Y+X6Ki66ICF5oOF5aCxLuWPl+iouuaXpSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVwZGF0ZVBhdGllbnRJbmZvKG9jclJlc3VsdC7lj5foqLrogIXmg4XloLEu5rCP5ZCNLCB2YWx1ZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIOaknOafu+mgheebruOBrue3qOmbhlxyXG4gICAqL1xyXG4gIGNvbnN0IGhhbmRsZUl0ZW1DaGFuZ2UgPSAoXHJcbiAgICBpbmRleDogbnVtYmVyLFxyXG4gICAgZmllbGQ6ICfpoIXnm67lkI0nIHwgJ+WApCcgfCAn5Y2Y5L2NJyB8ICfliKTlrponLFxyXG4gICAgdmFsdWU6IHN0cmluZ1xyXG4gICkgPT4ge1xyXG4gICAgaWYgKCFvY3JSZXN1bHQpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IGl0ZW0gPSB7IC4uLm9jclJlc3VsdC7mpJzmn7vntZDmnpxbaW5kZXhdIH1cclxuICAgIGlmIChmaWVsZCA9PT0gJ+WNmOS9jScgfHwgZmllbGQgPT09ICfliKTlrponKSB7XHJcbiAgICAgIGl0ZW1bZmllbGRdID0gdmFsdWUgfHwgbnVsbFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaXRlbVtmaWVsZF0gPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUV4YW1pbmF0aW9uSXRlbShpbmRleCwgaXRlbSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4Y2Vs55Sf5oiQ44Oa44O844K444G4XHJcbiAgICovXHJcbiAgY29uc3QgaGFuZGxlUHJvY2VlZFRvRXhjZWwgPSAoKSA9PiB7XHJcbiAgICBpZiAoIW9jclJlc3VsdCkge1xyXG4gICAgICBhbGVydCgnT0NS57WQ5p6c44GM44GC44KK44G+44Gb44KTJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgLy8g44K744OD44K344On44OzSUTjgpLjgq/jg6rjgqLvvIjmrKHlm57jgqvjg6Hjg6njg5rjg7zjgrjjgafmlrDjgZfjgYTjgrvjg4Pjgrfjg6fjg7PvvIlcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjdXJyZW50U2Vzc2lvbklkJylcclxuXHJcbiAgICAvLyBUT0RPOiAyLjYgRXhjZWznlJ/miJDjg5rjg7zjgrjjgavpgbfnp7tcclxuICAgIG5hdmlnYXRlKCcvZ2VuZXJhdGUtZXhjZWwnKVxyXG4gIH1cclxuXHJcbiAgLy8gRXhwb3J0IG1vZGFsIG9wZW4vY2xvc2UgKHBsYWNlaG9sZGVyIG9ubHkpXHJcbiAgY29uc3QgaGFuZGxlT3BlbkV4cG9ydCA9ICgpID0+IHNldEV4cG9ydE9wZW4odHJ1ZSlcbiAgY29uc3QgaGFuZGxlQ2xvc2VFeHBvcnQgPSAoKSA9PiBzZXRFeHBvcnRPcGVuKGZhbHNlKVxuICBjb25zdCBoYW5kbGVDb25maXJtRXhwb3J0ID0gKGZvcm1hdDogJ3hsc3gnIHwgJ2NzdicpID0+IHtcbiAgICAvLyBQbGFjZWhvbGRlciBvbmx5OyBkbyBub3QgdHJpZ2dlciBhY3R1YWwgZXhwb3J0XG4gICAgc2V0RXhwb3J0TWVzc2FnZShgRXhwb3J0ICgke2Zvcm1hdH0pIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiB0aGlzIGJ1aWxkLmApXG4gICAgc2V0RXhwb3J0RXJyb3IobnVsbClcbiAgICBzZXRFeHBvcnRPcGVuKGZhbHNlKVxuICB9XG4gIGNvbnN0IGhhbmRsZUNhbmNlbEV4cG9ydCA9ICgpID0+IHtcbiAgICBzZXRFeHBvcnRNZXNzYWdlKCdFeHBvcnQgY2FuY2VsZWQuJylcbiAgICBzZXRFeHBvcnRFcnJvcihudWxsKVxuICB9XG5cclxuICAvKipcclxuICAgKiDjgqvjg6Hjg6njgavmiLvjgotcclxuICAgKi9cclxuICBjb25zdCBoYW5kbGVCYWNrVG9DYW1lcmEgPSAoKSA9PiB7XHJcbiAgICBuYXZpZ2F0ZSgnL2NhbWVyYScpXHJcbiAgfVxyXG5cclxuICAvLyDjg4fjg5Djg4PjgrDjg63jgrBcclxuICBjb25zb2xlLmxvZygnW0NvbmZpcm1FZGl0UGFnZV0g44Os44Oz44OA44Oq44Oz44KwOicsIHtcclxuICAgIG9jclJlc3VsdDogb2NyUmVzdWx0ID8gJ+OBguOCiicgOiAn44Gq44GXJyxcclxuICAgIOaknOafu+e1kOaenOS7tuaVsDogb2NyUmVzdWx0Py7mpJzmn7vntZDmnpw/Lmxlbmd0aCB8fCAwLFxyXG4gICAgaXNQcm9jZXNzaW5nLFxyXG4gICAgZXJyb3IsXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLWdyYXktNTBcIj5cclxuICAgICAgey8qIOODmOODg+ODgOODvCAqL31cclxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJiZy13aGl0ZSBzaGFkb3ctc21cIj5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC13LTd4bCBteC1hdXRvIHB4LTQgcHktNCBzbTpweC02IGxnOnB4LThcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMFwiPueiuuiqjeODu+e3qOmbhjwvaDE+XHJcbiAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVCYWNrVG9DYW1lcmF9XHJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTYwMCBob3Zlcjp0ZXh0LWdyYXktOTAwXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIOKGkCDjgqvjg6Hjg6njgavmiLvjgotcclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9oZWFkZXI+XHJcblxyXG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJtYXgtdy03eGwgbXgtYXV0byBweC00IHB5LTYgc206cHgtNiBsZzpweC04XCI+XG4gICAgICAgIHsvKiBFeHBvcnQgc3RhdHVzIG1lc3NhZ2VzIChwbGFjZWhvbGRlcikgKi99XG4gICAgICAgIHtleHBvcnRNZXNzYWdlICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1iLTQgYmctYmx1ZS01MCB0ZXh0LWJsdWUtNzAwIHB4LTQgcHktMiByb3VuZGVkXCI+e2V4cG9ydE1lc3NhZ2V9PC9kaXY+XG4gICAgICAgICl9XG4gICAgICAgIHtleHBvcnRFcnJvciAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYi00IGJnLXJlZC01MCB0ZXh0LXJlZC03MDAgcHgtNCBweS0yIHJvdW5kZWRcIj57ZXhwb3J0RXJyb3J9PC9kaXY+XG4gICAgICAgICl9XG4gICAgICAgIHsvKiDliJ3mnJ/ljJbkuK0gKi99XHJcbiAgICAgICAge2lzSW5pdGlhbGl6aW5nICYmIChcclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcHktMTJcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgYW5pbWF0ZS1zcGluIHJvdW5kZWQtZnVsbCBoLTEyIHctMTIgYm9yZGVyLWItMiBib3JkZXItYmx1ZS01MDAgbWItNFwiPjwvZGl2PlxyXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWdyYXktNjAwXCI+6Kqt44G/6L6844G/5LitLi4uPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAgey8qIOaSruW9seeUu+WDj+OBrueiuuiqjSAqL31cclxuICAgICAgICB7IWlzSW5pdGlhbGl6aW5nICYmIChcclxuICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtbGcgc2hhZG93IHAtNiBtYi02XCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItNFwiPlxyXG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1zZW1pYm9sZFwiPuaSruW9seOBl+OBn+eUu+WDjzwvaDI+XHJcblxyXG4gICAgICAgICAgICAgICAgey8qIOODleOCoeOCpOODq+OCouODg+ODl+ODreODvOODieODnOOCv+ODsyAqL31cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJjdXJzb3ItcG9pbnRlciBiZy1ncmF5LTEwMCBob3ZlcjpiZy1ncmF5LTIwMCBweC00IHB5LTIgcm91bmRlZC1sZyB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VwdD1cImltYWdlLypcIlxyXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlXHJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUZpbGVVcGxvYWR9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaGlkZGVuXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAg8J+TgSDnlLvlg4/jgpLov73liqBcclxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcblxyXG4gICAgICAgICAgICAgICAgey8qIEV4cG9ydCBidXR0b24gKHBsYWNlaG9sZGVyKSAqL31cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshKG9jclJlc3VsdCAmJiAob2NyUmVzdWx0LuaknOafu+e1kOaenD8ubGVuZ3RoIHx8IDApID4gMCl9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVPcGVuRXhwb3J0fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibWwtMiBiZy1ibHVlLTYwMCB0ZXh0LXdoaXRlIHB4LTQgcHktMiByb3VuZGVkIGRpc2FibGVkOm9wYWNpdHktNTBcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIEV4cG9ydFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIHNtOmdyaWQtY29scy0zIG1kOmdyaWQtY29scy00IGdhcC00XCI+XHJcbiAgICAgICAgICAgICAgICB7Y3VycmVudEltYWdlcy5tYXAoKGltYWdlLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8SW1hZ2VUaHVtYm5haWwga2V5PXtpbWFnZS5pZH0gaW1hZ2U9e2ltYWdlfSBpbmRleD17aW5kZXh9IC8+XHJcbiAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgey8qIOeUu+WDj+OBjOOBquOBhOWgtOWQiOOBruODoeODg+OCu+ODvOOCuCAqL31cclxuICAgICAgICAgICAgICB7Y3VycmVudEltYWdlcy5sZW5ndGggPT09IDAgJiYgKFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS04IHRleHQtZ3JheS01MDBcIj5cclxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwibWItMlwiPueUu+WDj+OBjOOBguOCiuOBvuOBm+OCkzwvcD5cclxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbVwiPuOAjOeUu+WDj+OCkui/veWKoOOAjeODnOOCv+ODs+OBi+OCieWBpeW6t+iouuaWree1kOaenOOBrueUu+WDj+OCkuOCouODg+ODl+ODreODvOODieOBl+OBpuOBj+OBoOOBleOBhDwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICAgIHsvKiBPQ1Llh6bnkIbplovlp4vjg5zjgr/jg7MgKi99XHJcbiAgICAgICAgICAgICAgeyFvY3JSZXN1bHQgJiYgY3VycmVudEltYWdlcy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNlwiPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlU3RhcnRPQ1J9XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzUHJvY2Vzc2luZ31cclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgcHktMyByb3VuZGVkLWxnIGZvbnQtYm9sZCB0ZXh0LWxnIHRyYW5zaXRpb24gJHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ncmF5LTQwMCB0ZXh0LWdyYXktMjAwIGN1cnNvci1ub3QtYWxsb3dlZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctYmx1ZS01MDAgdGV4dC13aGl0ZSBob3ZlcjpiZy1ibHVlLTYwMCdcclxuICAgICAgICAgICAgICAgICAgICB9YH1cclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIHtpc1Byb2Nlc3NpbmcgPyAn5Yem55CG5LitLi4uJyA6ICdPQ1Llh6bnkIbjgpLplovlp4snfVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICAgICAgICAgIHsvKiDlh6bnkIbkuK0gKi99XHJcbiAgICAgICAgICAgIHtpc1Byb2Nlc3NpbmcgJiYgKFxyXG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtbGcgc2hhZG93IHAtNiBtYi02XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGFuaW1hdGUtc3BpbiByb3VuZGVkLWZ1bGwgaC0xMiB3LTEyIGJvcmRlci1iLTIgYm9yZGVyLWJsdWUtNTAwIG1iLTRcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTYwMFwiPk9DUuWHpueQhuS4reOBp+OBmeOAguOBl+OBsOOCieOBj+OBiuW+heOBoeOBj+OBoOOBleOBhC4uLjwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICAgIHsvKiDjgqjjg6njg7zooajnpLogKi99XHJcbiAgICAgICAgICAgIHtlcnJvciAmJiAoXHJcbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiYmctcmVkLTUwIGJvcmRlciBib3JkZXItcmVkLTIwMCByb3VuZGVkLWxnIHAtNiBtYi02XCI+XHJcbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtcmVkLTgwMCBtYi0yXCI+44Ko44Op44O8PC9oMj5cclxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtcmVkLTYwMFwiPntlcnJvcn08L3A+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVN0YXJ0T0NSfVxyXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHB4LTQgcHktMiBiZy1yZWQtNTAwIHRleHQtd2hpdGUgcm91bmRlZCBob3ZlcjpiZy1yZWQtNjAwXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg5YaN6Kmm6KGMXHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICB7LyogT0NS57WQ5p6c44Gu6KGo56S644O757eo6ZuGICovfVxyXG4gICAgICAgICAgICB7b2NyUmVzdWx0ICYmIChcclxuICAgICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgICAgey8qIOWPl+iouuiAheaDheWgsSAqL31cclxuICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtbGcgc2hhZG93IHAtNiBtYi02XCI+XHJcbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1zZW1pYm9sZCBtYi00XCI+5Y+X6Ki66ICF5oOF5aCxPC9oMj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgZ2FwLTRcIj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgbWItMVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIOawj+WQjVxyXG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e29jclJlc3VsdC7lj5foqLrogIXmg4XloLE/Luawj+WQjSB8fCAnJ31cclxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGhhbmRsZVBhdGllbnRJbmZvQ2hhbmdlKCfmsI/lkI0nLCBlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHJvdW5kZWQtbGcgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLXRyYW5zcGFyZW50IHRleHQtZ3JheS05MDBcIlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi5rCP5ZCN44GM5oq95Ye644GV44KM44Gq44GL44Gj44Gf5aC05ZCI44Gv5omL5YWl5Yqb44GX44Gm44GP44Gg44GV44GEXCJcclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBtYi0xXCI+XHJcbiAgICAgICAgICAgICAgICAgICAg5Y+X6Ki65pelXHJcbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17b2NyUmVzdWx0LuWPl+iouuiAheaDheWgsT8u5Y+X6Ki65pelIHx8ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gaGFuZGxlUGF0aWVudEluZm9DaGFuZ2UoJ+WPl+iouuaXpScsIGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIGJvcmRlciBib3JkZXItZ3JheS0zMDAgcm91bmRlZC1sZyBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItdHJhbnNwYXJlbnQgdGV4dC1ncmF5LTkwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCLlj5foqLrml6XjgYzmir3lh7rjgZXjgozjgarjgYvjgaPjgZ/loLTlkIjjga/miYvlhaXlipvjgZfjgabjgY/jgaDjgZXjgYRcIlxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuXHJcbiAgICAgICAgICAgIHsvKiDmpJzmn7vntZDmnpwgKi99XHJcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtbGcgc2hhZG93IHAtNiBtYi02XCI+XHJcbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1zZW1pYm9sZCBtYi00XCI+5qSc5p+757WQ5p6cPC9oMj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm92ZXJmbG93LXgtYXV0b1wiPlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIm1pbi13LWZ1bGwgZGl2aWRlLXkgZGl2aWRlLWdyYXktMjAwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzc05hbWU9XCJiZy1ncmF5LTUwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTQgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWdyYXktNTAwIHVwcGVyY2FzZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICDpoIXnm67lkI1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZ3JheS01MDAgdXBwZXJjYXNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIOWApFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC00IHB5LTMgdGV4dC1sZWZ0IHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1ncmF5LTUwMCB1cHBlcmNhc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAg5Y2Y5L2NXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTQgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWdyYXktNTAwIHVwcGVyY2FzZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICDliKTlrppcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZ3JheS01MDAgdXBwZXJjYXNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIOaTjeS9nFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwiYmctd2hpdGUgZGl2aWRlLXkgZGl2aWRlLWdyYXktMjAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge29jclJlc3VsdC7mpJzmn7vntZDmnpw/Lm1hcCgoaXRlbSwgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2luZGV4fSBjbGFzc05hbWU9XCJob3ZlcjpiZy1ncmF5LTUwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtpdGVtLumgheebruWQjSB8fCAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlSXRlbUNoYW5nZShpbmRleCwgJ+mgheebruWQjScsIGUudGFyZ2V0LnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTIgcHktMSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHJvdW5kZWQgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctYmx1ZS01MDAgdGV4dC1ncmF5LTkwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2l0ZW0u5YCkIHx8ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVJdGVtQ2hhbmdlKGluZGV4LCAn5YCkJywgZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTIgcHktMSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHJvdW5kZWQgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctYmx1ZS01MDAgdGV4dC1ncmF5LTkwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2l0ZW0u5Y2Y5L2NIHx8ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVJdGVtQ2hhbmdlKGluZGV4LCAn5Y2Y5L2NJywgZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTIgcHktMSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHJvdW5kZWQgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctYmx1ZS01MDAgdGV4dC1ncmF5LTkwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2l0ZW0u5Yik5a6aIHx8ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVJdGVtQ2hhbmdlKGluZGV4LCAn5Yik5a6aJywgZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTIgcHktMSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHJvdW5kZWQgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctYmx1ZS01MDAgdGV4dC1ncmF5LTkwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktM1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0oJ+OBk+OBrumgheebruOCkuWJiumZpOOBl+OBvuOBmeOBi++8nycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlRXhhbWluYXRpb25JdGVtKGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1yZWQtNTAwIGhvdmVyOnRleHQtcmVkLTcwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAg5YmK6ZmkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG5cclxuICAgICAgICAgICAgICAgIHsvKiBFeGNlbOeUn+aIkOOBuCAqL31cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWVuZFwiPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlUHJvY2VlZFRvRXhjZWx9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtOCBweS0zIGJnLWdyZWVuLTUwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCByb3VuZGVkLWxnIGhvdmVyOmJnLWdyZWVuLTYwMCB0cmFuc2l0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIOeiuuWumuOBl+OBpkV4Y2Vs55Sf5oiQ44G4IOKGklxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvPlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC8+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9tYWluPlxyXG5cclxuICAgICAgey8qIEV4cG9ydCBtb2RhbCBwbGFjZWhvbGRlciAqL31cbiAgICAgIDxFeHBvcnRNb2RhbCBvcGVuPXtleHBvcnRPcGVufSBvbkNsb3NlPXtoYW5kbGVDbG9zZUV4cG9ydH0gb25Db25maXJtPXtoYW5kbGVDb25maXJtRXhwb3J0fSBvbkNhbmNlbD17aGFuZGxlQ2FuY2VsRXhwb3J0fSAvPlxuICAgIDwvZGl2PlxyXG4gIClcclxufVxyXG5cclxuLyoqXHJcbiAqIOeUu+WDj+OCteODoOODjeOCpOODq1xyXG4gKi9cclxuaW50ZXJmYWNlIEltYWdlVGh1bWJuYWlsUHJvcHMge1xyXG4gIGltYWdlOiB7IGlkPzogbnVtYmVyOyBpbWFnZURhdGE6IEJsb2I7IG9yZGVyOiBudW1iZXIgfVxyXG4gIGluZGV4OiBudW1iZXJcclxufVxyXG5cclxuY29uc3QgSW1hZ2VUaHVtYm5haWw6IFJlYWN0LkZDPEltYWdlVGh1bWJuYWlsUHJvcHM+ID0gKHsgaW1hZ2UsIGluZGV4IH0pID0+IHtcclxuICBjb25zdCBbaW1hZ2VVcmwsIHNldEltYWdlVXJsXSA9IHVzZVN0YXRlPHN0cmluZz4oJycpXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGltYWdlLmltYWdlRGF0YSlcclxuICAgIHNldEltYWdlVXJsKHVybClcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybClcclxuICAgIH1cclxuICB9LCBbaW1hZ2UuaW1hZ2VEYXRhXSlcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgYXNwZWN0LXZpZGVvIGJnLWdyYXktMjAwIHJvdW5kZWQtbGcgb3ZlcmZsb3ctaGlkZGVuXCI+XHJcbiAgICAgIDxpbWcgc3JjPXtpbWFnZVVybH0gYWx0PXtg55S75YOPICR7aW5kZXggKyAxfWB9IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgb2JqZWN0LWNvdmVyXCIgLz5cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMiBsZWZ0LTIgYmctYmx1ZS01MDAgdGV4dC13aGl0ZSBweC0yIHB5LTEgcm91bmRlZCB0ZXh0LXhzIGZvbnQtYm9sZFwiPlxyXG4gICAgICAgIHtpbmRleCArIDF9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG59XHJcbiJdLCJmaWxlIjoiL2FwcC9zcmMvcGFnZXMvQ29uZmlybUVkaXRQYWdlLnRzeCJ9
