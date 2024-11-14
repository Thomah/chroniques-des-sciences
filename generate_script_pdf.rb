require 'asciidoctor'
require 'asciidoctor-pdf'

input_dir = 'script'
output_file = 'script.pdf'

adoc_files = Dir.glob("#{input_dir}/*.adoc")

combined_content = ""
adoc_files.each do |file|
  combined_content += File.read(file) + "\n"
end

Asciidoctor.convert(combined_content, backend: 'pdf', safe: :safe, to_file: output_file, attributes: { 'stylesdir' => 'script/', 'stylesheet' => 'styles.css' })

puts "Generated PDF : #{output_file}"
