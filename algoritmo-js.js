algoritimoEfetivo =  (()=>{

    let editor;
    let codigoSelecionado;
    
    //const palavrasEstilizar = ['var', 'nao', 'não', 'senão se','senao se', 'se',  'senao', ' E ', ' OU ','paraCada', 'para', 'enquanto', 'faça', 'faca', 'avalie', 'caso', 'parar', 'padrao', 'padrão']

    const interpreta = async ()=>{

        limpaLog();
        
        let algoritimo = this.editor.getDoc().getValue(); //document.getElementById('algoritimo').value;

        let codigo = algoritimo
                    .replace(/prompt\(/ig, 'await algoritimoEfetivo.recebe(')
                    .replace(/console.log\(/ig, ' algoritimoEfetivo.log(')
                    .replace(/alert\(/ig, 'await algoritimoEfetivo.alerta(');

        console.log(codigo);
        try {
            await eval(`(async()=>{${codigo}})()`);
        } catch (error) {
            //alert('falha no algoritimo.');
            console.error(error);

            let html = `<div class="alert alert-danger" role="alert"  id="div_erros">
                            Erros no código.
                            <span id="msg_erros">${error}</span>
                        </div>`;

            $('#div_log').append(html);

            //$('#div_erros').show();
            //$('#msg_erros').html(error);
        }
        
    }

    const log =  (valor)=>{
        let logAtual =  $('#div_log').html();
        logAtual += `<p> <span class="icon-terminal">></span> ${valor}</p>`;
         $('#div_log').html(logAtual);
    }

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function sleep(fn, ...args) {
        await timeout(3000);
        return fn(...args);
    }

    const alerta = async (msg)=>{
        $('#msg_alert').html(msg);
        await timeout(20);
        var myModal = new bootstrap.Modal(document.getElementById('modalAlert'), {
            backdrop : false
        });
        myModal.show();
    }

    const recebe = async (msg)=>{


        await timeout(20);

        $('.texto-recebe').html(msg);
        $('#btn_recebe_confirma').removeClass('clicou').removeClass('validado');
        $('.input-recebe').val('');
        var myModal = new bootstrap.Modal(document.getElementById('modalRecebe'), {
            backdrop : false,
            keyboard : false
        });
        myModal.show();

        $('.modal.show .input-recebe').focus();

        await timeout(300);


        while(!$('#btn_recebe_confirma').hasClass('clicou')
         && !$('#btn_recebe_confirma').hasClass('validado')){
            await timeout(100);
            continue;
        }
        
        await timeout(100);

        let valorRecebido = $('.modal.show .input-recebe').val();
        console.log('vai pegar o valor recebido', valorRecebido);

        myModal.hide();

        return valorRecebido;
    }

    const okRecebe = (botao)=>{

        const modal = $(botao).closest('.modal');
        let valor = $(modal).find('.input-recebe').val() || "";
        valor = valor.trim();
        if(valor == ""){
            $(modal).find('.error').show();
        }else{
            $(modal).find('.error').hide();
            $(botao).addClass('clicou');
            $(botao).addClass('validado');
        }
    }
    
    const limpaLog = ()=>{
        $('#div_erros').remove();
        const divLog = document.getElementById('div_log');
        divLog.innerHTML = '';
        $(divLog).css({"visibility" : "hidden"});
        setTimeout(()=>{
            $(divLog).css({"visibility" : "visible"});
        }, 1);
    }

    const salvaAluno = ()=>{
        sincronizaAluno(()=>{
            Swal.fire(
                `Ok`,
                'Dados salvos com sucesso',
                'success'
                );
        })
    }

    const sincronizaAluno = (cbSucesso)=>{
        cbSucesso = cbSucesso || (()=>{});
        salvaCodigo();
        let aluno = getAlunoLocal();
        fbService.salvaDados(aluno, cbSucesso);
    }

    const salvaCodigo = ()=>{
        const  algoritimo =  this.editor.getDoc().getValue();
        let aluno = getAlunoLocal();
        aluno.codigosJs = aluno.codigosJs || [];

        const index = aluno.codigosJs.findIndex((x)=>x.nome == this.codigoSelecionado.nome);
        aluno.codigosJs[index].codigo = algoritimo;
        setObjLocal('aluno', aluno);
    }

    const verificaDadosAluno = async ()=>{
        let aluno = getObjLocal('aluno');
        let logado = true;

        if(!aluno){
            logado = false;
            aluno = {};
            //aluno.email = prompt('E seu e-mail?');
            const { value: email } = await Swal.fire({
                title: 'Olá, qual seu e-mail?',
                input: 'email',
                //inputLabel: 'Seu e-mail',
                inputPlaceholder: 'Entre com seu e-mail'
              });
            aluno.email = email;
        }
              
            
        fbService.getDados(aluno, async (alunoBase)=>{

            if(alunoBase){
                aluno = alunoBase;
                aluno.codigosJs ||= [{ nome : 'Inicial', codigo :  '//escreva seu primeiro código javascript aqui'}];
                defineCodigoSelecionado(aluno);
                setObjLocal('aluno',aluno);
                populaSelect(aluno);
                atualizaDadosTela();
                if(!logado){
                    Swal.fire(
                        `Olá, ${aluno.nome}!`,
                        'Bem vindo de volta!',
                        'success'
                        );
                }
            }else{
                const { value: name } =   await Swal.fire({
                    title: 'Bem vindo ao algoritimo efetivo. Qual seu nome?',
                    input: 'text',
                    inputPlaceholder: 'Digite seu primeiro nome'
                    });
                
                aluno.nome = name;
                //aluno.nome = prompt('Bem vindo ao algoritimo efetivo. Qual seu nome?');
                aluno.codigosJs = [];
                aluno.codigosJs.push({ nome : 'Inicial', codigo :  '//escreva seu primeiro código javascript aqui'});
                defineCodigoSelecionado(aluno);
                populaSelect(aluno);

                fbService.salvaDados(aluno, ()=>{
                    setObjLocal('aluno',aluno);
                    atualizaDadosTela();
                }, ()=>{
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'nao foi possível salvar seus dados no momento. Mas ainda sim você pode editar algorítimos.'
                        })
                    atualizaDadosTela();
                });
            }
        }, ()=>{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'tivemos um problema ao tentar identificar você. Mas você ainda pode usar o editor, só que sem salvar seus dados.'
                })
            //alert('Ops, tivemos um problema ao tentar identificar você. Mas você ainda pode usar o editor, só que sem salvar seus dados.');
            aluno.codigosJs = [];
            aluno.codigosJs.push({ nome : 'Inicial', codigo :  '//escreva seu primeiro algoritimo aqui'});
            defineCodigoSelecionado(aluno);
            atualizaDadosTela();
        });
        // }else{

        //     defineCodigoSelecionado(aluno);
        //     populaSelect(aluno);
        //     atualizaDadosTela();
        // }
    }

    const defineCodigoSelecionado = (aluno)=>{
        this.codigoSelecionado =  aluno.codigosJs[aluno.codigosJs.length-1];
    }

    const atualizaDadosTela = ()=>{
        $('#select_codigos').val(this.codigoSelecionado.nome);
        this.editor.getDoc().setValue(this.codigoSelecionado.codigo);
        $('#nome_aluno').html(getObjLocal('aluno').nome);
    }
    
    const populaSelect = (aluno)=>{
        const $select = $('#select_codigos');
        $select.html('');
        aluno.codigosJs.forEach(cod=>{
            $select.append(`<option value="${cod.nome}">${cod.nome}</option>`);
        })
        
    }

    const changeCodigo = (elem)=>{
        salvaCodigo();
        const aluno = getAlunoLocal('aluno');
        const index = aluno.codigosJs.findIndex(x=>x.nome == elem.value);
        this.codigoSelecionado = aluno.codigosJs[index];
        atualizaDadosTela();
    }

    const novoCodigo = async (elem)=>{
        
        salvaCodigo();

        const { value: name } =   await Swal.fire({
            title: 'Dê um nome para seu novo código',
            input: 'text',
            inputPlaceholder: 'Nome do código'
        });

        const aluno = getObjLocal('aluno');
        codigo = { nome : name, codigo : ''};
        aluno.codigosJs.push(codigo);
        setObjLocal('aluno', aluno);
        this.codigoSelecionado = codigo;
        populaSelect(aluno);
        atualizaDadosTela();
    }

    const getAlunoLocal = ()=>{
        return  getObjLocal('aluno');
    }

    const logout = ()=>{
        sincronizaAluno(()=>{
            setObjLocal('aluno', null);
            window.location.reload();
        });
    }

    const init = ()=>{
        // const estilizar = {};
        // palavrasEstilizar.forEach(x=>{
        //     estilizar[x.trim()] = 'style1';
        //     estilizar[x.toUpperCase().trim()] = 'style1';
        // })
        
        this.editor = CodeMirror.fromTextArea(
        document.getElementById("algoritimo"), {
            mode: 'javascript',
            lineNumbers: true,
            theme: "dracula"
            // ,keyword: estilizar
        });

        

        verificaDadosAluno();

        setInterval(sincronizaAluno, 300000);

    }


    return {
        log, 
        alerta,
        recebe,
        interpreta,
        init,
        logout,
        changeCodigo,
        novoCodigo,
        salvaAluno,
        okRecebe
    }

})();

const getObjLocal = (nome)=>{
    try {
        return JSON.parse(localStorage.getItem(nome));
    } catch (error) {
        return undefined;
    }
}

const setObjLocal = (nome, obj)=>{
    try {
        return  localStorage.setItem(nome, JSON.stringify(obj)) ;
    } catch (error) {
        return undefined;
    }
}

const alertSw = ()=>{
    
}


const fbService = (()=>{

    let app;

    const init = ()=>{
        const firebaseConfig = {
            apiKey: "AIzaSyBhqNCF9FTuMIOQKe9WC1LcRf7DOrwBaI4",
            authDomain: "algoritimo-efetivo.firebaseapp.com",
            projectId: "algoritimo-efetivo",
            storageBucket: "algoritimo-efetivo.appspot.com",
            messagingSenderId: "760804447992",
            appId: "1:760804447992:web:7b724a912547876f2d0d0d"
        };

        // Initialize Firebase
        this.app = firebase.initializeApp(firebaseConfig);
      
    }

    const getDados = (aluno, cbSuccess, cbError)=>{
        let firestore = firebase.firestore(); 
        const docRef = firestore.collection('alunos');
        
        docRef.doc(aluno.email).get().then(function(x) {
            console.log("documento lido!");
            cbSuccess(x.data());
          })
          .catch(function(error) {
              console.error("Erro lendo documento: ", error);
              cbError(error);
          });
    }

    const salvaDados = (aluno, cbSucesso, cbErro)=>{
        let fn = ()=>{};
        cbSucesso = cbSucesso || fn;
        cbErro = cbErro || fn;

        let firestore = firebase.firestore(); 
        const docRef = firestore.collection('alunos');
        docRef.doc(aluno.email).set(aluno).then(function(docRef) {
          console.log("Document successfully written!", docRef);
          cbSucesso(docRef);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
            cbErro(error);
        });
        
    }

    return {
        salvaDados,
        getDados,
        init
    }

})();

fbService.init();
algoritimoEfetivo.init();




