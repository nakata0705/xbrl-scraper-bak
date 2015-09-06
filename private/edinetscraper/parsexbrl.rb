#!/usr/local/rvm/rubies/ruby-2.1.5/bin/ruby

require 'open-uri'
require 'rexml/document'
require './params.rb'

$tags = Hash.new { |h,k| h[k] = Hash.new(&h.default_proc) };

def parse_xbrl(base_dirname)
    filelist = Dir.glob("#{base_dirname}/*.xbrl");
    if filelist.length != 1
        puts "Unexpected number of xbrl files. #{filelist.length}";
        return -1;
    end
    
    f = File.open(filelist[0]);
    doc = REXML::Document.new(f);
    filename = filelist[0];
    REXML::XPath.each(doc, "//*[contains(@contextRef, 'Current')]") do |e|
        tagname = e.name.to_s;
        context = e.attributes["contextRef"].to_s;
        if $tags[filename][context].class != Array
            $tags[filename][context] = Array.new();
            $tags[filename][context].push(tagname);
        else
            $tags[filename][context].push(tagname);
        end
        $tags[filename][context].uniq!;
        $tags[filename][context].sort!;
    end
end

$edinetcode = ARGV[0];
if File.exist?("#{$workdir_name}/#{$edinetcode}.zip") == false
    exit(-1);
end

system("unzip -o -q -d #{$workdir_name}/#{$edinetcode} #{$workdir_name}/#{$edinetcode}.zip");
if File.exist?("#{$workdir_name}/#{$edinetcode}") == false
    exit(-1);
end

Dir.foreach("#{$workdir_name}/#{$edinetcode}") do |f|
    if File.ftype("#{$workdir_name}/#{$edinetcode}/#{f}") == "directory" && f != "." && f != ".."
        if File.exist?("#{$workdir_name}/#{$edinetcode}/#{f}/XBRL")
            parse_xbrl("#{$workdir_name}/#{$edinetcode}/#{f}/XBRL/PublicDoc");
        else
            parse_xbrl("#{$workdir_name}/#{$edinetcode}/#{f}");
        end
    end
end

puts $tags;