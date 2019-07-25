require 'sketchup.rb'
require 'json'
require 'securerandom'


module AS_Extensions
  module AS_SkpDev
    class SkpDev < UI::HtmlDialog
      def initialize(env)
        
        @base_dir = File.dirname(__FILE__)
        # Get this file's directory
        @base_dir = File.dirname(__FILE__)
                  
        # Get user directory
        @user_dir = (ENV['USERPROFILE'] != nil) ? ENV['USERPROFILE'] :
          ((ENV['HOME'] != nil) ? ENV['HOME'] : @base_dir )

        @snip_dir = @user_dir
        
        title = "开发工具"
        title += "-开发调试版"
        

        super({ :dialog_title => title, :width => 200, :height => 60,
          :style => UI::HtmlDialog::STYLE_DIALOG, :preferences_key => title.gsub(/\s+/, "_") })
        
        
        set_url('http://localhost:9001')
        navigation_buttons_enabled = false
        show


        add_action_callback("save_json") { | dlg, params |
          file = UI.savepanel("保存json文件", @snip_dir, "Json文件|*.json|")
          return if file.nil?
          file.tr!("\\", "/")
          @snip_dir = File.dirname(file)
          extension = File.extname(file)
          file = file + ".json" if extension == ""
          name = File.basename(file)
          str = params
          str.gsub!(/\r\n/, "\n")
          File.open(file, "w") { | f | f.puts str}
        }

        add_action_callback("load_json") { |dlg, params |
          file = UI.openpanel("读取json", @snip_dir, "Json文件|*.json|")
          return if file.nil?
          file.tr!("\\","/")
          @snip_dir = File.dirname(file)
          f = File.new(file, 'r')
          text = f.readlines.join
          dlg.execute_script("window.receiveLoadData(#{text})")
          f.close
        }

        add_action_callback("openRubyConsole") { | dlg |
          Sketchup.send_action "showRubyPanel:"
        }

        add_action_callback("clearRubyConsole") { | dlg |
          SKETCHUP_CONSOLE.clear
        }

        add_action_callback("exec") do |dlg, params, code|
            # Provide some status text
            # dlg.execute_script( "addResults('Running the code...')" )
            # Execute the code with eval and rescue if error

            r = nil                                
            begin
              # ... Wrap everything in single undo if desired
              Sketchup.active_model.start_operation "RCE Code Run" if params == 'true'
              begin  # ... Evaluation under the top level binding
                r = eval( code , TOPLEVEL_BINDING )
              rescue => e
                r = e  # ... could do: e.backtrace.join('\n')
                raise  # ... Pass to outer rescue clause if error
              end  
            rescue  # ... If error
              Sketchup.active_model.abort_operation
              r = 'Run aborted. Error: ' + e
            else  # ... Commit process if no errors
              Sketchup.active_model.commit_operation if params == 'true'
            ensure  # ... Always do this
              r!=nil ? r = r.to_s : r='Nil result (no result returned or run failed)'
              p r  # ... Also return result to console
              # ... Format for HTML box
              r.gsub!(/ /, "&nbsp;")
              r.gsub!(/\n/, "<br>")
              r.gsub!(/'/, "&rsquo;")
              r.gsub!(/`/, "&lsquo;")
              r.gsub!(/</, "&lt;")
              
              # Provide some status text and return result
              dlg.execute_script("runResult('Done running code. Ruby says: <span class=\\'hl\\'>#{r}</span>')")
            end
            
          end  # add_action_callback("exec")          

      end

    end

    unless file_loaded?(__FILE__)
      flag = FileTest::exists?("#{File.dirname(__FILE__)}/html/index.html")
      if flag == true
        puts "加载skp开发插件成功"
        sub = UI.menu("Window").add_submenu("skp开发")
        sub.add_item("skp开发") { edtDlg = AS_SkpDev::SkpDev.new('pro')}
        file_loaded(__FILE__)
      end
    end
  end

  AS_SkpDev::SkpDev.new('dev')
  
end
