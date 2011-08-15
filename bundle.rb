template "Sample File Template" do |t|
  t.filetype = "*.txt"
  t.invoke do |context|
    raw_contents = IO.read("#{File.dirname(ENV['TM_BUNDLE_SUPPORT'])}/templates/sample.html")
    raw_contents.gsub(/\$\{([^}]*)\}/) {|match| ENV[match[2..-2]] }
  end
end