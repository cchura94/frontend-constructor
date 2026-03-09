import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:3000/api/chatbot";

function BotBuilder() {
    const [nodes, setNodes] = useState([]);
    const [activeNodeId, setActiveNodeId] = useState(null);

    useEffect(() => {
        obtenerNodos();
    }, []);

    const obtenerNodos = async () => {
        try {
            const res = await axios.get(`${API_URL}/nodes?botId=1`);
            setNodes(res.data);
            if (res.data.length > 0) {
                setActiveNodeId(res.data[0].id);
            }
        } catch (error) {
            console.error("Error cargando nodos:", error);
        }
    };

    const activeNode = nodes.find(n => n.id === activeNodeId);

    // --- MANEJADORES DE ESTADO ---

    const updateLocalNode = (field, value) => {
        setNodes(nodes.map(n => n.id === activeNodeId ? { ...n, [field]: value } : n));
    };

    const updateLocalOption = (optid, field, value) => {
        const updateNodes = nodes.map(n => {
            if (n.id === activeNodeId) {
                return {
                    ...n,
                    opciones: n.opciones.map(o => o.id === optid ? { ...o, [field]: value } : o)
                };
            }
            return n;
        });
        setNodes(updateNodes);
    };

    const handlerAddNode = () => {
        const newNode = {
            id: Date.now(), // ID temporal
            node_key: `flujo_${nodes.length + 1}`,
            mensaje: "Nuevo mensaje de bienvenida",
            opciones: []
        };
        setNodes([...nodes, newNode]);
        setActiveNodeId(newNode.id);
    };

    const handlerAddOption = () => {
        if (!activeNode) return;
        const newOption = {
            id: Date.now(),
            key: (activeNode.opciones.length + 1).toString(),
            text: "Nueva Opción",
            next_node_id: null,
            respuesta: { type: 'text' }
        };
        updateLocalNode('opciones', [...activeNode.opciones, newOption]);
    };

    const handlerDeleteOption = (optId) => {
        if (!confirm("¿Estás seguro de eliminar esta Opción?")) return;
        updateLocalNode('opciones', activeNode.opciones.filter(o => o.id !== optId));
    };

    const handleSave = async () => {
        console.log("Guardando configuración...", nodes);
        // Aquí iría tu axios.post o put
        alert("Configuración guardada (ver consola)");
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 bg-[#f1f5f9] h-screen overflow-hidden font-sans">
            
            {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                
                <header className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Bot Designer</h2>
                        <p className="text-xs text-slate-500 font-medium">Gestionando: <span className="text-indigo-600">WhatsApp Bot v1.0</span></p>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-3 rounded-xl text-sm font-bold shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all transform hover:scale-105 active:scale-95"
                    >
                        Guardar Cambios
                    </button>
                </header>

                {/* SELECTOR DE FLUJOS (NODOS) */}
                <div className="flex gap-2 overflow-x-auto py-2 pb-4">
                    {nodes.map(node => (
                        <button 
                            key={node.id} 
                            onClick={() => setActiveNodeId(node.id)} 
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap ${activeNodeId === node.id ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                        >
                            {node.node_key}
                        </button>
                    ))}
                    <button 
                        onClick={handlerAddNode}
                        className="px-5 py-2.5 rounded-xl text-xs font-black border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all whitespace-nowrap"
                    >
                        + Nuevo Flujo
                    </button>
                </div>

                {/* EDITOR DE MENSAJE PRINCIPAL */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Mensaje de bienvenida</label>
                        <span className="text-[10px] bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 font-mono font-bold">KEY: {activeNode?.node_key}</span>
                    </div>
                    <textarea
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-slate-700"
                        value={activeNode?.mensaje || ""}
                        onChange={(e) => updateLocalNode('mensaje', e.target.value)}
                        rows="4"
                        placeholder="Escribe el mensaje que enviará el bot..."
                    ></textarea>
                </div>

                {/* SECCIÓN DE OPCIONES */}
                <div className="space-y-4 pb-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Opciones del Menú</h3>
                        <button 
                            onClick={handlerAddOption}
                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
                        >
                            + Añadir Opción
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {activeNode?.opciones?.map((opt) => (
                            <div key={opt.id} className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-indigo-300 shadow-sm transition-all">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">NÚMERO</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-center font-black text-indigo-600 outline-none focus:ring-2 ring-indigo-100" 
                                            value={opt.key} 
                                            onChange={(e) => updateLocalOption(opt.id, 'key', e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-span-9">
                                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">ETIQUETA DEL BOTÓN</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 border-none rounded-xl p-2.5 font-bold text-slate-600 outline-none focus:ring-2 ring-indigo-100" 
                                            value={opt.text} 
                                            onChange={(e) => updateLocalOption(opt.id, 'text', e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-end justify-center pb-2">
                                        <button 
                                            onClick={() => handlerDeleteOption(opt.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors text-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400">ACCIÓN:</span>
                                        <select
                                            className="bg-transparent text-xs font-bold text-indigo-600 outline-none"
                                            value={opt.next_node_id ? 'submenu' : opt.respuesta?.type}
                                            onChange={(e) => updateLocalOption(opt.id, 'type', e.target.value)}
                                        >
                                            <option value="text">Enviar Texto</option>
                                            <option value="image">Enviar Imagen</option>
                                            <option value="location">Enviar Ubicación</option>
                                            <option value="documento">Enviar Documento</option>
                                            <option value="submenu">Ir a otro Sub-Menú</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PANEL DERECHO: SIMULADOR WHATSAPP (EDICIÓN DINÁMICA) */}
            <div className="hidden lg:flex w-[400px] justify-center items-start pt-4 bg-white/50 rounded-3xl border border-white shadow-inner">
                <div className="sticky top-4 w-[320px] h-[640px] bg-[#e5ddd5] rounded-[3rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden relative flex flex-col scale-95 origin-top">
                    
                    {/* Notch & Status Bar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30"></div>
                    
                    {/* Header WhatsApp */}
                    <div className="bg-[#075e54] pt-10 pb-3 px-4 flex items-center gap-3 text-white shadow-md relative z-10">
                        <div className="w-9 h-9 bg-slate-300 rounded-full flex-shrink-0 flex items-center justify-center text-slate-500">
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight">Mi-Chatbot</p>
                            <p className="text-[10px] opacity-80 italic">en línea ahora</p>
                        </div>
                    </div>

                    {/* Chat Area con Background */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                        
                        {/* Mensaje de Bienvenida Dinámico */}
                        <div className="max-w-[85%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm relative group">
                            <textarea
                                className="w-full text-[13px] text-slate-800 bg-transparent border-none focus:ring-0 p-0 resize-none leading-relaxed font-normal overflow-hidden"
                                value={activeNode?.mensaje || ""}
                                onChange={(e) => updateLocalNode('mensaje', e.target.value)}
                                rows={activeNode?.mensaje?.split('\n').length || 2}
                                placeholder="Escribe el mensaje..."
                            />
                            <div className="flex justify-end items-center gap-1 mt-1">
                                <span className="text-[9px] text-slate-400">
                                    {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}
                                </span>
                                <span className="text-blue-400 text-[10px]">✓✓</span>
                            </div>
                        </div>

                        {/* Opciones Dinámicas en el Celular */}
                        <div className="space-y-2">
                            {activeNode?.opciones?.map((opt) => (
                                <div 
                                    key={opt.id} 
                                    className="bg-white/90 border border-indigo-100 flex items-center px-4 rounded-xl shadow-sm hover:bg-white transition-all transform active:scale-95 cursor-text"
                                >
                                    <span className="text-[11px] font-bold text-indigo-400 border-r border-indigo-50 pr-3 mr-3 py-2">
                                        {opt.key}
                                    </span>
                                    <input 
                                        type="text"
                                        className="w-full bg-transparent border-none text-indigo-600 text-center py-2 text-xs font-bold focus:ring-0 outline-none p-0"
                                        value={opt.text}
                                        onChange={(e) => updateLocalOption(opt.id, 'text', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Input (Visual Only) */}
                    <div className="bg-[#f0f0f0] p-2 flex items-center gap-2">
                        <div className="flex-1 bg-white h-9 rounded-full px-4 text-xs text-slate-400 flex items-center">Mensaje...</div>
                        <div className="w-9 h-9 bg-[#128c7e] rounded-full flex items-center justify-center text-white">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BotBuilder;