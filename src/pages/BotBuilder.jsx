import axios from "axios"
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:3000/api/chatbot"

function BotBuilder({botId}) {

    const [nodes, setNodes] = useState([]);
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [botPrompt, setBotPrompt] = useState("");

    useEffect(() => {
        if(botId){
            obtenerNodos()
            obtenerConfiguracionBot()
            
        }else{
            console.log("No se recibió un botId válido")
        }
    }, [botId]);

    const obtenerConfiguracionBot = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:3000/api/bots/"+botId);
            setBotPrompt(res.data.prompt || "");
        } catch (error) {
            console.log("Error al capturar el bot")
        }
    }


    const obtenerNodos = async () => {

        const res = await axios.get(`${API_URL}/nodes?botId=${botId}`);

        console.log(res.data);
        setNodes(res.data);

        if (res.data.length > 0) {
            setActiveNodeId(res.data[0].id);
        }
    }

    const activeNode = nodes.find(n => n.id === activeNodeId)

    const updateLocalNode = (field, value) => {
        setNodes(nodes.map(n => n.id === activeNodeId ? { ...n, [field]: value } : n));
    }

    const updateLocalOption = (optid, field, value) => {
        const updateNodes = nodes.map(n => {
            if (n.id === activeNodeId) {
                return {
                    ...n,
                    opciones: n.opciones.map(o => o.id === optid ? { ...o, [field]: value } : o)
                }

            }
            return n;
        });

        setNodes(updateNodes);
    }

    const handleCreateNewNode = async () => {
        const newNodeNombre = prompt("Ingrese el nombre del nuevo menú (reclamos, horarios):");

        if(!newNodeNombre) return;

        const nodeId = newNodeNombre.toLowerCase().trim().replace(/\s+/g, '_');

        if(nodes.find(n => n.node_key === nodeId)){
            return alert("Ya existe un nodo con ese nombre");
        }

        const newNodeData = {
            node_key: nodeId,
            mensaje: "Escribe aquí el mensaje de este nuevo menú",
            tipo_mensaje: "text",
            botId: botId // modificar dependiendo el bot
        }

        try {
            const res = await axios.post(`${API_URL}/nodes`, newNodeData);

            const nodeConOpcionesVacias = { ...res.data, opciones: [] };
            setNodes([...nodes, nodeConOpcionesVacias]);
            setActiveNodeId(res.data.id);
            alert(`Nodo "${nodeId}" creado`);
            
        } catch (error) {
            console.log(error);
            alert("Error al crear el nodo en la base de datos");
        }
        
    }

    const hadleAddOption = () => {
        let res = `${Date.now()}`
        // let id = 9
        const newOption = {
            id: res,
            key: "+",
            text: "Nueva Opción",
            chatbotNodeId: activeNodeId,
            next_node_id: null,
            respuesta: {
                type: "text",
                body: "Mensaje de respuesta"
            }
        }

        setNodes(nodes.map(n => n.id === activeNodeId?{...n, opciones: [...(n.opciones || []), newOption]}: n))
    }

    const handleSaveChanges = async () => {
        try {

            await axios.put(`http://127.0.0.1:3000/api/bots/${botId}`, {prompt: botPrompt});

            // 1. Actrualizar el Mensaje del Nodo
            await axios.put(`${API_URL}/nodes/${activeNode?.id}`, {mensaje: activeNode?.mensaje});
            // 2. Procesar cada opcion
            console.log(activeNode);
            const optionPromises = activeNode.opciones.map(opt => {
                if(opt.id && typeof opt.id === 'number'){
                    console.log("actualiza option: ", opt)
                    return axios.put(`${API_URL}/options/${opt.id}`, opt);
                }else{
                    const {id, ...newOptData} = opt;
                    return axios.post(`${API_URL}/options`, newOptData);
                }
            });
            await Promise.all(optionPromises);

            obtenerNodos()
            alert("Cambios guardados con éxito");
        } catch (error) {
            alert("Error al guardar los cambios")
        }
    }


    const handlerDeleteOption = async (optId) => {
        if (!confirm("¿Estás seguro de eliminar esta Opción?")) return;

    }

    const changeOptionType = (optId, type) => {
        const updatedNodes = nodes.map(n => {
            return {
                ...n, opciones: n.opciones.map(o => {
                    if(o.id === optId){
                        if(type === 'submenu') return { ...o, next_node_id: 'main', respuesta: null };
                        return { ...o, next_node_id: null, respuesta: {type, body: "", url: ""} }
                    }
                    return o;
                })
            }
            return n;
        });

        setNodes(updatedNodes);
    }
    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 bg-[#f8fafc] h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h2>Configuraciónn del Bot</h2>
                        <p>Nodo Activo: main</p>
                    </div>
                    <button 
                        onClick={handleSaveChanges}
                        className={`px-6 py-3 rounded-xl text-sm shadow-lg flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200`}>
                        Guardar Cambios
                    </button>
                </header>

                <div className="flex gap-2 overflow-x-auto py-2">
                    {nodes.map(node => (
                        <button key={node.id} onClick={() => setActiveNodeId(node.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${activeNodeId === node.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}>{node.node_key}</button>
                    ))}
                    <button onClick={handleCreateNewNode} className="px-4 py-2 rounded-xl text-xs font-black border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all">
                        Nuevo Flujo
                    </button>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <label htmlFor="">Mensaje de bienvenida</label>
                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">Flujo: {activeNode?.node_key}</span>
                    </div>
                    <textarea
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl "
                        value={activeNode?.mensaje}
                        onChange={(e) => updateLocalNode('mensaje', e.target.value)}
                        rows="4"
                        placeholder="Escribe el mensaje que enviará el bot..."
                    ></textarea>
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2">
                        <label className="font-bold text-indigo-900 text-sm">Personalidad de la IA (System Prompt)</label>
                    </div>
                    <textarea className="w-full p-4 bg-white border-none rounded-2xl shadow-sm text-sm" rows="3" value={botPrompt} onChange={(e) => setBotPrompt(e.target.value)}></textarea>
                    <p>Este prompt guiará las respuestas de la IA </p>
                </div>

                {/* Seccion opciones */}

                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase">Opciones del Menú</h3>
                    <button onClick={hadleAddOption} className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs hover:bg-indigo-700 transition-all">Añadir Opción</button>

                    {activeNode?.opciones?.map((opt) => (
                        <div key={opt.id} className="group bg-white border-2 border-slate-100 rounded-3xl p-5 hover-border-indigo-200 shadow-sm">
                            <div className="grid grid-cols-12 gap-4 mb-5">
                                <div className="col-span-2">
                                    <input type="text" className="w-full bg-slate-50 border-none rounded-lg p-2 text-center font-black text-indigo-600 outline-none" value={opt.key} onChange={(e) => updateLocalOption(opt.id, 'key', e.target.value)} />
                                </div>
                                <div className="col-span-9">
                                    <label>Etiqueta del botón</label>
                                    <input type="text" className="w-full bg-slate-50 border-none rounded-lg p-2 text-center font-black text-slate-600 outline-none" value={opt.text} onChange={(e) => updateLocalOption(opt.id, 'text', e.target.value)} />
                                </div>
                                <div className="col-span-1 flex items-end justify-center" onClick={() => handlerDeleteOption(opt.id)}>
                                    <button>❌</button>
                                </div>
                            </div>

                            <div className="bg-[#fcfcfc] border border-indigo-50 p-4 rounded-2xl space-y-4">
                                <div className="flex items-center gap-3">

                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                        *
                                    </div>
                                    <select
                                        className=" p-2 rounded-lg text-indigo-600"
                                        value={opt.next_node_id?'submenu': opt.respuesta?.type}
                                        onChange={(e) => changeOptionType(opt.id, e.target.value)}
                                        >
                                        <option value="text">Enviar Texto</option>
                                        <option value="image">Enviar Imagen</option>
                                        <option value="location">Enviar Ubicación</option>
                                        <option value="document">Enviar Documento</option>
                                        <option value="submenu">Ir a otro Sub-Menú</option>
                                    </select>

                                    <div className="pt-2 border-t border-slete-100">
                                        {opt.next_node_id?(
                                            <div className="space-y-2">
                                                <label className="text-[10px]">Nodo destino</label>
                                                <select name="" id="" className="w-full p-2 bg-white border-slate-200 rounded_lg text-sm" value={opt.next_node_id} onChange={(e) => updateLocalOption(opt.id, 'next_node_id', e.target.value)}>
                                                    {nodes.map(n => <option key={n.id} value={n.id}>{n.node_key}</option>)}
                                                </select>

                                            </div>
                                        ):(
                                            <div className="space-y.3">
                                                {opt.respuesta?.type === 'text' && (
                                                    <input type="text" className="w-full p-2 bg-white border rounded-lg text-sm" 
                                                    value={opt.respuesta?.body || ""}
                                                    onChange={(e) => updateLocalOption(opt.id, 'respuesta', {...opt.respuesta, body: e.target.value})} />
                                                )}
                                                {(opt.respuesta?.type === 'image' || opt.respuesta?.type === 'document') && (
                                                    <div className="space-y-2">

                                                        <input 
                                                            type="text"
                                                            className="w-full p-2 bg-white border rounded-lg text-sm"
                                                            value={opt.respuesta?.link || ""}
                                                            placeholder="Ingrese Link url"
                                                            onChange={(e) => updateLocalOption(opt.id, 'respuesta', { ...opt.respuesta, link: e.target.value })}
                                                         />

                                                        <input 
                                                            type="text"
                                                            className="w-full p-2 bg-white border rounded-lg text-sm"
                                                            value={opt.respuesta?.caption || ""}
                                                            placeholder="Ingrese Caption"
                                                            onChange={(e) => updateLocalOption(opt.id, 'respuesta', { ...opt.respuesta, caption: e.target.value })}
                                                         />
                                                    </div>
                                                )}
                                                { opt.respuesta?.type === 'location' && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input 
                                                            className="p-2 bg-white border rounded-lg text-sm"
                                                            placeholder="Latitud"
                                                            value={opt.respuesta?.latitude || ""}
                                                            onChange={(e) => updateLocalOption(opt.id, 'respuesta', {...opt.respuesta, latitude: e.target.value})}
                                                         />
                                                         <input 
                                                            className="p-2 bg-white border rounded-lg text-sm"
                                                            placeholder="Longitud"
                                                            value={opt.respuesta?.longitude || ""}
                                                            onChange={(e) => updateLocalOption(opt.id, 'respuesta', {...opt.respuesta, longitude: e.target.value})}
                                                         />
                                                         <input 
                                                            className="p-2 bg-white border rounded-lg text-sm"
                                                            placeholder="Nombre del Lugar (Ej. Banco Central)"
                                                            value={opt.respuesta?.name || ""}
                                                            onChange={(e) => updateLocalOption(opt.id, 'respuesta', {...opt.respuesta, name: e.target.value})}
                                                         />
                                                         <input 
                                                            className="p-2 bg-white border rounded-lg text-sm"
                                                            placeholder="Dirección Completa"
                                                            value={opt.respuesta?.address || ""}
                                                            onChange={(e) => updateLocalOption(opt.id, 'respuesta', {...opt.respuesta, address: e.target.value})}
                                                         />
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>

                    ))

                    }
                </div>
            </div>



            
            <div className="hidden lg:flex w-[350px] justify-center items-start pt-4">
                <div className="sticky top-4 w-[320px] h-[600px] bg-[#edd] rounded-[3em] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl x-20"></div>
                    <div className="bg-[#075e54] pt-8 pb-3 px-4 flex items-center gap-2 text-white shadow-md">
                        <div>
                            <p className="text-xs font-bold">Mi-Chatbot</p>
                            <p className="text-[10px] opacity-80">en Linea</p>
                        </div>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
                        <div className="max-w-[85%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm relative animate-in slide-in-from-left-2">
                            <p className="text-[13px] text-slate-800 whitespace-pre-wrap">{ activeNode?.mensaje || "Escribe un Mensaje..." } </p>
                            <span className="text-[9px] text-slate-400 float-right mt-0">{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, 0)}</span>
                        </div>
                        <div className="space-y-2">
                            {activeNode?.opciones?.map((opt, idx) => (
                                <div key={idx} className="bg-white/90 border border-indigo-100 text-indigo-600 text-center py-2 px-4 rounded-xl text-xs font-bold hover:bg-white">
                                    {opt.key}. {opt.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/*
            <div className=" w-full lg:w-[400px] sticky top-4 h-fit">
                <div className="bg-slate-900 rounded-md p-6 border-[8px] border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <pre className="text-[11px] text-indigo-200">{JSON.stringify(activeNode, null, 2)}</pre>
                    </div>
                </div>
            </div>
            */}
        </div>
    )
}

export default BotBuilder;