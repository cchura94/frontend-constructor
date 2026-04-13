import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:3000/api"

function BotManager({onConfigure}){
    const [misBots, setMisBots] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newBot, setNewBot] = useState({name: "", plataforma: 'cloud', number: "", identifier: ""});

    useEffect(() => {
        fetchBots()
    }, [])

    const fetchBots = async () => {
        try {
            const res = await axios.get(`${API_URL}/bots`);
            setMisBots(res.data);

        } catch (error) {
            console.log("Error cargando bots: ", error);
        }
    }

    const handleCreateBot = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/bots`, newBot);
            setMisBots([res.data, ...misBots]);
            setIsModalOpen(false);
        } catch (error) {
            alert("Error al crear el bot");
        }
    }

    return <>
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Mis Bots</h2>
                <p className="text-sm text-slate-500">Gestiona y entrena tus CHATBOTS</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded font-semibold shadow-indigo-200 flex">+ Crear Nuevo Bot</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {misBots.map((bot) => (
                <div key={bot.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-indigo-300 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 rounded-2xl text-2xl">
                            {bot.plataforma === 'cloud'?'☁️': '🦍'}
                        </div>
                        <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${bot.status === true?'bg-emerald-100': 'bg-amber-100 text-amber-600'}`}>{bot.status?'Activo':'Inactivo'}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{bot.name}</h3>
                    <div className="p-3 bg-slate-50 rounded-2xl text-2xl">
                            {bot.plataforma === 'cloud'?'Whatsapp Cloud Api': 'Evolution Api'}
                        </div>
                    <button className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded text-sm font-bold" onClick={() => onConfigure(bot.id)}>Configurar Bot</button>
                </div>
            ))}

        </div>
    </div>

    {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            </div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-black text-slate-800 mb-2">Nuevo Chatbot</h2>
                <p>Configura tu chatbot</p>
                <form onSubmit={handleCreateBot} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre del Bot</label>
                        <input type="text" required className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none "
                        placeholder="Ej. Asistente Inmobiliario" value={newBot.name} onChange={(e) => setNewBot({...newBot, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Número Cel</label>
                        <input type="text" required className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none "
                        placeholder="59173277937" value={newBot.number} onChange={(e) => setNewBot({...newBot, number: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Identificador (Phone ID/ Instancia)</label>
                        <input type="text" required className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none "
                        placeholder="Ej. 12365456546 o instancia_ventas" value={newBot.identifier} onChange={(e) => setNewBot({...newBot, identifier: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">PLataforma</label>
                        <select className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none">
                            <option value="cloud">Whatsapp Cloud Api</option>
                            <option value="evolution">Evolution Api</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="flex-1 bg-indigo-600 px-6 py-4 rounded-2xl font-bold text-white hover:bg-indigo-700">Crear Bot</button>

                    </div>

                </form>
            </div>
        </div>
    )}
    </>

}

export default BotManager;